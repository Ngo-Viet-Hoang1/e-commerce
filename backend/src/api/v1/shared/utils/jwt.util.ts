import jwt from 'jsonwebtoken'
import { JWT_SCOPE } from '../../modules/auth/auth.constant'
import type {
  AccessTokenPayload,
  IssueTokensOptions,
  RefreshTokenPayload,
} from '../interfaces/jwt-payload.interface'
import { UnauthorizedException } from '../models/app-error.model'

export class JwtUtils {
  static issueTokens = (options: IssueTokensOptions) => {
    const { userId, roleIds = [], deviceId, ip } = options

    const accessToken = this.generateAccessToken(userId, roleIds)
    const refreshToken = this.generateRefreshToken(userId, deviceId, ip)

    return { accessToken, refreshToken }
  }

  static generateAccessToken = (
    userId: number,
    roleIds: number[] = [],
  ): string => {
    const secret = process.env.JWT_SECRET || 'jwt-secret'
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h'

    const payload: AccessTokenPayload = {
      id: userId,
      roleIds,
      scope: JWT_SCOPE.ACCESS,
    }

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions)
  }

  static generateRefreshToken = (
    userId: number,
    deviceId?: string,
    ip?: string,
  ) => {
    const secret = process.env.JWT_REFRESH_SECRET || 'jwt-refresh-secret'
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

    const payload: RefreshTokenPayload = {
      id: userId,
      scope: JWT_SCOPE.REFRESH,
      deviceId: deviceId || 'unknown-device',
      ip: ip || 'unknown-ip',
    }

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions)
  }

  static verifyAccessToken = (
    token: string,
  ): jwt.JwtPayload | string | undefined => {
    const secret = process.env.JWT_SECRET || 'jwt-secret'

    try {
      return jwt.verify(token, secret)
    } catch {
      throw new UnauthorizedException('Invalid Access Token')
    }
  }

  static verifyRefreshToken = (
    token: string,
  ): jwt.JwtPayload | string | undefined => {
    const secret = process.env.JWT_REFRESH_SECRET || 'jwt-refresh-secret'

    try {
      return jwt.verify(token, secret)
    } catch {
      throw new UnauthorizedException('Invalid Refresh Token')
    }
  }
}
