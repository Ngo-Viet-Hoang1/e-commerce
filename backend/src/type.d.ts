import type { AccessTokenPayload } from '@v1/shared/interfaces/jwt-payload.interface'
import type { userRepository } from './api/v1/modules/user'

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AccessTokenPayload {}
    interface Request {
      userWithRolesAndPerms?: Awaited<
        ReturnType<typeof userRepository.findUserWithRolesAndPerms>
      >
      validatedData?: {
        body?: unknown
        query?: unknown
        params?: unknown
        headers?: unknown
      }
    }
  }
}
