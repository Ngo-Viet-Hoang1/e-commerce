export interface ErrorContext {
  userId?: string
  operation?: string
  resource?: string
  resourceId?: string
  requestId?: string
  [key: string]: unknown
}
