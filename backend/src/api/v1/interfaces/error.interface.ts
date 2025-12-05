export interface ErrorContext {
  userId?: string
  operation?: string
  resource?: string
  resourceId?: string
  requestId?: string
  [key: string]: unknown
}

export interface ErrorLogPayload {
  error: {
    name: string
    message: string
    stack?: string
    code: string
    category: string
    severity: string
  }
  request: {
    requestId?: string
    method: string
    url: string
    ip?: string
    userAgent?: string
  }
  user: {
    id: string
    email: string
  }
  timestamp: string
}
