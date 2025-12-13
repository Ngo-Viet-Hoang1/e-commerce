import type { Request, Response } from 'express'
import { UnauthorizedException } from '../../shared/models/app-error.model'
import { SuccessResponse } from '../../shared/models/success-response.model'
import { RequestUtils } from '../../shared/utils/request.util'
import { userService, type CreateUserBody } from '../user'
import type { LoginBody } from './auth.schema'
import { authService } from './auth.service'
import { AuthUtils } from './auth.util'

class AuthController {
  me = async (req: Request, res: Response) => {
    const user = req.user!
    const me = await authService.me(user.id)

    SuccessResponse.send(res, { me }, 'User profile fetched successfully')
  }

  register = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as CreateUserBody

    const user = await userService.create(data)

    SuccessResponse.send(res, { user }, 'User registered successfully')
  }

  login = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as LoginBody
    const meta = RequestUtils.getRequestMetadata(req)

    const { userId, email, accessToken, refreshToken } =
      await authService.login({
        ...data,
        ...meta,
      })

    AuthUtils.setRefreshTokenCookie(res, refreshToken)

    SuccessResponse.send(
      res,
      { user: { userId, email }, accessToken },
      'Login successful',
    )
  }

  logout = async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided')
    }

    await authService.logout(refreshToken)

    AuthUtils.clearRefreshTokenCookie(res)

    SuccessResponse.send(res, {}, 'Logout successful')
  }

  logoutAll = async (req: Request, res: Response) => {
    const user = req.user!

    await authService.logoutAll(user.id)

    AuthUtils.clearRefreshTokenCookie(res)

    SuccessResponse.send(res, {}, 'Logout successful')
  }

  refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided')
    }

    const meta = RequestUtils.getRequestMetadata(req)

    const { userId, email, accessToken, newRefreshToken } =
      await authService.refreshToken({
        token: refreshToken,
        ...meta,
      })

    AuthUtils.setRefreshTokenCookie(res, newRefreshToken)

    SuccessResponse.send(
      res,
      { user: { userId, email }, accessToken },
      'Token refreshed successfully',
    )
  }
}

export const authController = new AuthController()
export default AuthController
