import { CategoryService } from '@/entities/category'
import type { PaginationParams } from '@/shared/types'
import { useQuery } from '@tanstack/react-query'

export const queryKeys = {
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (params: PaginationParams) =>
      [...queryKeys.categories.lists(), params] as const,
  },
}

export const useCategories = (params: PaginationParams) => {
  return useQuery({
    queryKey: queryKeys.categories.list(params),
    queryFn: () => CategoryService.getPaginated(params),
    placeholderData: (previousData) => previousData,
  })
}
