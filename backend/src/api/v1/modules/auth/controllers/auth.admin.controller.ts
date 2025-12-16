import type { Request, Response } from 'express'
import { UnauthorizedException } from '../../../shared/models/app-error.model'
import { SuccessResponse } from '../../../shared/models/success-response.model'
import { RequestUtils } from '../../../shared/utils/request.util'
import type { LoginBody } from '../auth.schema'
import { authService } from '../auth.service'
import { AuthUtils } from '../auth.util'

class AdminAuthController {
  me = async (req: Request, res: Response) => {
    const user = req.user!
    const me = await authService.me(user.id)

    SuccessResponse.send(res, { me }, 'Admin profile fetched successfully')
  }

  login = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as LoginBody
    const meta = RequestUtils.getRequestMetadata(req)

    const { userId, email, accessToken, refreshToken } =
      await authService.login({
        ...data,
        ...meta,
      })

    AuthUtils.setAdminRefreshToken(res, refreshToken)

    SuccessResponse.send(
      res,
      { user: { userId, email }, accessToken },
      'Login successful',
    )
  }

  logout = async (req: Request, res: Response) => {
    const { adminRefreshToken: refreshToken } = req.cookies
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided')
    }

    await authService.logout(refreshToken)

    AuthUtils.clearAdminRefreshToken(res)

    SuccessResponse.send(res, {}, 'Logout successful')
  }

  logoutAll = async (req: Request, res: Response) => {
    const user = req.user!

    await authService.logoutAll(user.id)

    AuthUtils.clearAdminRefreshToken(res)

    SuccessResponse.send(res, {}, 'Logout successful')
  }

  refreshToken = async (req: Request, res: Response) => {
    const { adminRefreshToken: refreshToken } = req.cookies
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided')
    }

    const meta = RequestUtils.getRequestMetadata(req)

    const { userId, email, accessToken, newRefreshToken } =
      await authService.refreshToken({
        token: refreshToken,
        ...meta,
      })

    AuthUtils.setAdminRefreshToken(res, newRefreshToken)

    SuccessResponse.send(
      res,
      { user: { userId, email }, accessToken },
      'Token refreshed successfully',
    )
  }
}

export const adminAuthController = new AdminAuthController()
export default AdminAuthController
