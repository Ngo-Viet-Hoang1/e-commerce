import AdminProductService from '@/api/services/admin/product.admin.service'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import type { CreateProduct } from '@/interfaces/product.interface'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const queryKeys = {
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (params: PaginationParams) =>
      [...queryKeys.products.lists(), params] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.products.details(), id] as const,
  },
}

export const useProducts = (params: PaginationParams) => {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => AdminProductService.getPaginated(params),
    placeholderData: (previousData) => previousData,
  })
}

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => AdminProductService.getById(id),
    enabled: !!id,
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productData: CreateProduct) =>
      AdminProductService.create(productData),

    onSuccess: () => {
      toast.success('Product created successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() })
    },

    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? 'Failed to create product'
      toast.error(message)
    },
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateProduct> }) =>
      AdminProductService.update(id, data),

    onSuccess: (_, { id }) => {
      toast.success('Product updated successfully')

      queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(id),
      })

      queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      })
    },

    onError: () => {
      toast.error('Failed to update product')
    },
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => AdminProductService.delete(id),

    onSuccess: () => {
      toast.success('Product deleted successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() })
    },

    onError: () => {
      toast.error('Failed to delete product')
    },
  })
}
