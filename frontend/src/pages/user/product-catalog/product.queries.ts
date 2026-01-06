import ProductService from '@/api/services/user/product.service'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { useQuery } from '@tanstack/react-query'

export const queryKeys = {
  products: {
    all: ['catalog-products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (params: PaginationParams) =>
      [...queryKeys.products.lists(), params] as const,
    allList: (params: PaginationParams) =>
      [...queryKeys.products.all, 'all', params] as const,
  },
}

export const useCatalogProducts = (params: PaginationParams) => {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => ProductService.getPaginated(params),
    placeholderData: (previousData) => previousData,
  })
}

const fetchAllProducts = async (params: PaginationParams) => {
  const firstPage = await ProductService.getPaginated({ ...params, page: 1 })
  const totalPages = firstPage.meta?.totalPages ?? 1
  if (totalPages <= 1) return firstPage.data ?? []

  const remainingPages = Array.from({ length: totalPages - 1 }, (_, index) => {
    const page = index + 2
    return ProductService.getPaginated({ ...params, page })
  })

  const remainingResults = await Promise.all(remainingPages)
  return [
    ...(firstPage.data ?? []),
    ...remainingResults.flatMap((result) => result.data ?? []),
  ]
}

export const useAllCatalogProducts = (params: PaginationParams) => {
  return useQuery({
    queryKey: queryKeys.products.allList(params),
    queryFn: () => fetchAllProducts(params),
    placeholderData: (previousData) => previousData ?? [],
  })
}
