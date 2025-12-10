import logger from '../../shared/config/logger'
import { UnauthorizedException } from '../../shared/models/app-error.model'
import { PasswordUtils } from '../../shared/utils/password.util'
import { userRepository } from '../user'
import type { LoginProps, RefreshTokenProps } from './auth.interface'
import { JwtUtils } from './jwt.util'
import RefreshTokenStore from './refresh-token.store'

class AuthService {
  login = async ({ email, password, deviceId, ip }: LoginProps) => {
    const user = await userRepository.findByEmailForAuth(email)
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const isPasswordValid = await PasswordUtils.comparePassword(
      password,
      user.password,
    )
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials')

    const roles = await userRepository.findRolesByUserId(user.id)
    const roleIds = roles?.userRoles.map((ur) => ur.role.id)

    const { accessToken, refreshToken } = await JwtUtils.issueTokens({
      userId: user.id,
      roleIds,
      deviceId,
      ip,
    })

    await userRepository.update(user.id, { lastLoginAt: new Date() })

    return { userId: user.id, email: user.email, accessToken, refreshToken }
  }

  refreshToken = async ({ token, deviceId, ip }: RefreshTokenProps) => {
    const payload = await JwtUtils.verifyRefreshToken(token)
    if (!payload) throw new UnauthorizedException('Invalid refresh token')

    const isValidToken = await RefreshTokenStore.validateAndConsume(token)
    if (!isValidToken)
      throw new UnauthorizedException('Invalid or expired refresh token')

    if (payload.deviceId !== deviceId || payload.ip !== ip) {
      logger.warn('Device/IP mismatch', { userId: payload.id })
    }

    const userId = payload.id
    const [user, roles] = await Promise.all([
      userRepository.findById(userId),
      userRepository.findRolesByUserId(userId),
    ])
    if (!user) throw new UnauthorizedException('User not found')
    const roleIds = roles?.userRoles.map((ur) => ur.role.id)

    const { accessToken, refreshToken } = await JwtUtils.issueTokens({
      userId,
      roleIds,
      deviceId,
      ip,
    })

    return {
      userId,
      email: user?.email,
      accessToken,
      newRefreshToken: refreshToken,
    }
  }
}

export const authService = new AuthService()
export default AuthService
