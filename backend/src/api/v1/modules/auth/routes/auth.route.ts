import { Router } from 'express'
import {
  authenticate,
  requireUser,
} from '../../../shared/middlewares/auth.middleware'
import { validate } from '../../../shared/schemas'
import { createUserBodySchema } from '../../user'
import { authController } from '../controllers/auth.controller'
import { loginBodySchema } from '../auth.schema'

const router = Router()

router.post(
  '/register',
  validate(createUserBodySchema, 'body'),
  authController.register,
)

router.post('/login', validate(loginBodySchema, 'body'), authController.login)

router.post('/refresh-token', authController.refreshToken)

router.get('/me', authenticate, requireUser, authController.me)

router.post('/logout', authenticate, requireUser, authController.logout)

router.post('/logout-all', authenticate, requireUser, authController.logoutAll)

export default router
