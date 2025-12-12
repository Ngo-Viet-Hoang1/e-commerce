import { Router } from 'express'
import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { validate } from '../../../shared/schemas'
import { createUserBodySchema } from '../../user'
import { authController } from '../controllers/auth.controller'
import { loginBodySchema } from '../auth.schema'

const router = Router()

router.get('/me', authenticate, authController.me)

router.post(
  '/register',
  validate(createUserBodySchema, 'body'),
  authController.register,
)

router.post('/login', validate(loginBodySchema, 'body'), authController.login)

router.post('/logout', authenticate, authController.logout)

router.post('/logout-all', authenticate, authController.logoutAll)

router.post('/refresh-token', authController.refreshToken)

export default router
