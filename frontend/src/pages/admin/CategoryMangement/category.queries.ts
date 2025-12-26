import AdminCategoryService from '@/api/services/admin/category.admin.service'
import type { Category } from '@/interfaces/category.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { UpdateCategoryInputs } from './category.schema'

export const queryKeys = {
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (params: PaginationParams) =>
      [...queryKeys.categories.lists(), params] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.categories.details(), id] as const,
  },
}

export const useCategories = (params: PaginationParams) => {
  return useQuery({
    queryKey: queryKeys.categories.list(params),
    queryFn: () => AdminCategoryService.getPaginated(params),

    placeholderData: (previousData) => previousData,
  })
}

export const useCategorie = (id: number) => {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => AdminCategoryService.getById(id),
    enabled: !!id,
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoryData: Partial<Category>) =>
      AdminCategoryService.create(categoryData),

    onSuccess: () => {
      toast.success('Category created successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() })
    },

    onError: () => {
      toast.error('Failed to create category')
    },
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryInputs }) =>
      AdminCategoryService.update(id, data),

    onSuccess: (_, { id }) => {
      toast.success('Category updated successfully')

      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.detail(id),
      })

      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.lists(),
      })
    },

    onError: () => {
      toast.error('Failed to update category')
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => AdminCategoryService.softDelete(id),

    onSuccess: () => {
      toast.success('Category deleted successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() })
    },

    onError: () => {
      toast.error('Failed to delete category')
    },
  })
}
