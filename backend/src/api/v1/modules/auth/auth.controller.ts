import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import { userService, type CreateUserBody } from '../user'

class AuthController {
  register = async (req: Request, res: Response) => {
    const data = req.validatedData?.params as CreateUserBody

    const user = await userService.create(data)

    SuccessResponse.send(res, user, 'User registered successfully')
  }
}

export const authController = new AuthController()
export default AuthController
