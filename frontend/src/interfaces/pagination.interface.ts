import type { SORT_ORDER } from '@/constants'

export type SortOrder = (typeof SORT_ORDER)[keyof typeof SORT_ORDER]

export type SortConfig = Record<string, SortOrder>

export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: SortOrder
  search?: string
  filters?: Record<string, unknown>
  sortOptions?: SortConfig
}
