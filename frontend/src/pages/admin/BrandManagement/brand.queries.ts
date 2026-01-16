import AdminBrandService from '@/api/services/admin/brand.admin.service'
import type { Brand } from '@/interfaces/brand.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { UpdateBrandInputs } from './brand.schema'

export const queryKeys = {
  brands: {
    all: ['brands'] as const,
    lists: () => [...queryKeys.brands.all, 'list'] as const,
    list: (params: PaginationParams) =>
      [...queryKeys.brands.lists(), params] as const,
    details: () => [...queryKeys.brands.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.brands.details(), id] as const,
  },
}

export const useBrands = (params: PaginationParams) => {
  return useQuery({
    queryKey: queryKeys.brands.list(params),
    queryFn: () => AdminBrandService.getPaginated(params),

    placeholderData: (previousData) => previousData,
  })
}

export const useBrand = (id: number) => {
  return useQuery({
    queryKey: queryKeys.brands.detail(id),
    queryFn: () => AdminBrandService.getById(id),
    enabled: !!id,
  })
}

export const useCreateBrand = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (brandData: Partial<Brand>) =>
      AdminBrandService.create(brandData),

    onSuccess: () => {
      toast.success('Brand created successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.lists() })
    },

    onError: () => {
      toast.error('Failed to create brand')
    },
  })
}

export const useUpdateBrand = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBrandInputs }) =>
      AdminBrandService.update(id, data),

    onSuccess: (_, { id }) => {
      toast.success('Brand updated successfully')

      queryClient.invalidateQueries({
        queryKey: queryKeys.brands.detail(id),
      })

      queryClient.invalidateQueries({
        queryKey: queryKeys.brands.lists(),
      })
    },

    onError: () => {
      toast.error('Failed to update brand')
    },
  })
}

export const useDeleteBrand = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => AdminBrandService.softDelete(id),

    onSuccess: () => {
      toast.success('Brand deleted successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.lists() })
    },

    onError: () => {
      toast.error('Failed to delete brand')
    },
  })
}
