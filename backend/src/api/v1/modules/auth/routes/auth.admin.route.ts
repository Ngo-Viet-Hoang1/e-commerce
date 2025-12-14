import { Router } from 'express'
import {
  authenticate,
  requireAdmin,
} from '../../../shared/middlewares/auth.middleware'
import { validate } from '../../../shared/schemas'
import { loginBodySchema } from '../auth.schema'
import { adminAuthController } from '../controllers/auth.admin.controller'

const router = Router()

router.post(
  '/login',
  validate(loginBodySchema, 'body'),
  adminAuthController.login,
)

router.post('/refresh-token', adminAuthController.refreshToken)

router.get('/me', authenticate, requireAdmin, adminAuthController.me)

router.post('/logout', authenticate, requireAdmin, adminAuthController.logout)

router.post(
  '/logout-all',
  authenticate,
  requireAdmin,
  adminAuthController.logoutAll,
)

export default router
