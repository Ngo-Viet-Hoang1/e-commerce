export interface PaginationMetadata {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage: number
  prevPage: number
}

export interface IApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  meta?: PaginationMetadata
  timestamp: string
  path?: string
  requestId?: string
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
  meta: PaginationMetadata
}

export interface AppErrorDetail {
  code: string
  statusCode: number
  category: string
  severity: string
  details?: unknown
  context?: Record<string, unknown>
  stack?: string
}

export interface IErrorResponse extends IApiResponse<null> {
  success: false
  status: 'fail' | 'error'
  error: AppErrorDetail
  method: string
  requestId?: string
}
