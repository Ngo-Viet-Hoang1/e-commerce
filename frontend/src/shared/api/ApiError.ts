export class ApiError extends Error {
  status?: number
  errors?: Record<string, string[]>
  isNetworkError?: boolean

  constructor(
    message: string,
    status?: number,
    errors?: Record<string, string[]>,
    isNetworkError = false,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.isNetworkError = isNetworkError

    // Maintain proper stack trace
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}
