import type { AccessTokenPayload } from '@v1/shared/interfaces/jwt-payload.interface'

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AccessTokenPayload {}
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
