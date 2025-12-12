import { Router } from 'express'
import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { validate } from '../../../shared/schemas'
import { loginBodySchema } from '../auth.schema'
import { adminAuthController } from '../controllers/auth.admin.controller'

const router = Router()

router.get('/me', authenticate, adminAuthController.me)

router.post(
  '/login',
  validate(loginBodySchema, 'body'),
  adminAuthController.login,
)

router.post('/logout', authenticate, adminAuthController.logout)

router.post('/logout-all', authenticate, adminAuthController.logoutAll)

router.post('/refresh-token', adminAuthController.refreshToken)

export default router
