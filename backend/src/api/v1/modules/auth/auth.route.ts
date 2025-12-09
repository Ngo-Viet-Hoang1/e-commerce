import { Router } from 'express'
import { validate } from '../../shared/schemas'
import { createUserBodySchema } from '../user'
import { authController } from './auth.controller'
import { loginBodySchema } from './auth.schema'

const router = Router()

router.post(
  '/register',
  validate(createUserBodySchema, 'body'),
  authController.register,
)

router.post('/login', validate(loginBodySchema, 'body'), authController.login)

router.post('/refresh-token', authController.refreshToken)

export default router
