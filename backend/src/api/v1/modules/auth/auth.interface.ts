import type { LoginBody } from './auth.schema'

export interface LoginProps extends LoginBody {
  deviceId?: string
  ip?: string
}

export interface RefreshTokenProps {
  token: string
  deviceId?: string
  ip?: string
}
