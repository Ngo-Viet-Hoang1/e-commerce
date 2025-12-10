import type { AccessTokenPayload } from './api/v1/shared/interfaces/jwt-payload.interface'

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload
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
