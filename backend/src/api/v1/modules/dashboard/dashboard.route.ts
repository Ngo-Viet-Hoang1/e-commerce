import { Router } from 'express'
import {
  authenticate,
  requireAdmin,
} from '../../shared/middlewares/auth.middleware'
import { validate } from '../../shared/middlewares/validate.middleware'
import { dashboardController } from './dashboard.controller'
import { dashboardStatsQuerySchema } from './dashboard.schema'

const router = Router()

router.get(
  '/stats',
  authenticate,
  requireAdmin,
  validate(dashboardStatsQuerySchema, 'query'),
  dashboardController.getStats,
)

export default router
