import jwt from 'jsonwebtoken'
import type {
  AccessTokenPayload,
  IssueTokensOptions,
  RefreshTokenPayload,
} from '../../shared/interfaces/jwt-payload.interface'
import { UnauthorizedException } from '../../shared/models/app-error.model'
import { JWT_SCOPE } from './auth.enum'
import RefreshTokenStore from './refresh-token.store'

export class JwtUtils {
  static issueTokens = async (options: IssueTokensOptions) => {
    const { userId, roleIds = [], deviceId, ip } = options

    const accessToken = this.generateAccessToken(userId, roleIds)
    const refreshToken = this.generateRefreshToken(userId, deviceId, ip)

    const decoded = jwt.decode(refreshToken) as jwt.JwtPayload
    const ttlSeconds = decoded.exp
      ? decoded.exp - Math.floor(Date.now() / 1000)
      : 7 * 24 * 60 * 60

    if (ttlSeconds <= 0) {
      throw new UnauthorizedException('Invalid Refresh Token Expiry')
    }

    await RefreshTokenStore.store(userId, refreshToken, {
      ip,
      deviceId,
      ttlSeconds,
    })

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
