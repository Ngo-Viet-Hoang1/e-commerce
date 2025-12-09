import type { JWT_SCOPE } from '../../modules/auth/auth.constant'

export interface AccessTokenPayload {
  id: number
  roleIds?: number[]
  scope: JWT_SCOPE.ACCESS
  iat?: number
  exp?: number
}

export interface RefreshTokenPayload {
  id: number
  scope: JWT_SCOPE.REFRESH
  deviceId: string
  ip: string
  iat?: number
  exp?: number
}

export interface IssueTokensOptions {
  userId: number
  roleIds?: number[]
  deviceId?: string
  ip?: string
}
