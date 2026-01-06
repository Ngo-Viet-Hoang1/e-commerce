import BrandService from '@/api/services/user/brand.service'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { useQuery } from '@tanstack/react-query'

export const queryKeys = {
  brands: {
    all: ['brands'] as const,
    lists: () => [...queryKeys.brands.all, 'list'] as const,
    list: (params: PaginationParams) =>
      [...queryKeys.brands.lists(), params] as const,
  },
}

export const useBrands = (params: PaginationParams) => {
  return useQuery({
    queryKey: queryKeys.brands.list(params),
    queryFn: () => BrandService.getPaginated(params),
    placeholderData: (previousData) => previousData,
  })
}
