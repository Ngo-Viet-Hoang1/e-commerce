import { UnauthorizedException } from '../../shared/models/app-error.model'
import { JwtUtils } from '../../shared/utils/jwt.util'
import { PasswordUtils } from '../../shared/utils/password.util'
import { userRepository } from '../user'
import type { LoginProps } from './auth.interface'

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

    const { accessToken, refreshToken } = JwtUtils.issueTokens({
      userId: user.id,
      roleIds,
      deviceId,
      ip,
    })

    await userRepository.update(user.id, { lastLoginAt: new Date() })

    return { userId: user.id, email: user.email, accessToken, refreshToken }
  }
}

export const authService = new AuthService()
export default AuthService
