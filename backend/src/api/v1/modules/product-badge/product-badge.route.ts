import { Router } from 'express'
import {
  authenticate,
  requireAdmin,
} from '../../shared/middlewares/auth.middleware'
import { validate } from '../../shared/middlewares/validate.middleware'
import { productBadgeController } from './product-badge.controller'
import {
  createProductBadgeBodySchema,
  listProductBadgesQuerySchema,
  productBadgeParamSchema,
} from './product-badge.schema'

const router = Router()

router.get(
  '/',
  validate(listProductBadgesQuerySchema, 'query'),
  productBadgeController.findAll,
)

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createProductBadgeBodySchema, 'body'),
  productBadgeController.create,
)

router.delete(
  '/:productId/:badgeId',
  authenticate,
  requireAdmin,
  validate(productBadgeParamSchema, 'params'),
  productBadgeController.delete,
)

router.delete(
  '/:productId/:badgeId/soft',
  authenticate,
  requireAdmin,
  validate(productBadgeParamSchema, 'params'),
  productBadgeController.softDelete,
)

router.post(
  '/:productId/:badgeId/restore',
  authenticate,
  requireAdmin,
  validate(productBadgeParamSchema, 'params'),
  productBadgeController.restore,
)

export default router
