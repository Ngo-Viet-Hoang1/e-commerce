import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import { AuthUtils } from './auth.util'
import { userService, type CreateUserBody } from '../user'
import type { LoginBody } from './auth.schema'
import { authService } from './auth.service'
import { RequestUtils } from '../../shared/utils/request.util'

class AuthController {
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
}

export const authController = new AuthController()
export default AuthController
