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

export interface IErrorResponse extends IApiResponse<null> {
  success: false
  status: 'fail' | 'error'
  error: {
    code: string
    statusCode: number
    category: string
    severity: string
    details?: unknown
    context?: Record<string, unknown>
    stack?: string
  }
  method: string
  requestId?: string
}

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
