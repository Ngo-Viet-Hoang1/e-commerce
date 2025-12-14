import { Router } from 'express'
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
  validate(createProductBadgeBodySchema, 'body'),
  productBadgeController.create,
)

router.delete(
  '/:productId/:badgeId',
  validate(productBadgeParamSchema, 'params'),
  productBadgeController.delete,
)

router.delete(
  '/:productId/:badgeId/soft',
  validate(productBadgeParamSchema, 'params'),
  productBadgeController.softDelete,
)

router.post(
  '/:productId/:badgeId/restore',
  validate(productBadgeParamSchema, 'params'),
  productBadgeController.restore,
)

export default router
