declare global {
  namespace Express {
    interface Request {
      validatedData?: {
        body?: unknown
        query?: unknown
        params?: unknown
        headers?: unknown
      }
    }
  }
}

export {}
