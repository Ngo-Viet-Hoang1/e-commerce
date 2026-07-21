import { Router } from 'express'
import {
  authenticate,
  requireAdmin,
} from '../../shared/middlewares/auth.middleware'
import {
  validate,
  validateMultiple,
} from '../../shared/middlewares/validate.middleware'
import { badgeController } from './badge.controller'
import {
  badgeIdParamSchema,
  createBadgeBodySchema,
  listBadgesQuerySchema,
  updateBadgeBodySchema,
} from './badge.schema'

const router = Router()

router.get(
  '/',
  validate(listBadgesQuerySchema, 'query'),
  badgeController.findAll,
)

router.get(
  '/:id',
  validate(badgeIdParamSchema, 'params'),
  badgeController.findById,
)

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createBadgeBodySchema, 'body'),
  badgeController.create,
)

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateMultiple({
    params: badgeIdParamSchema,
    body: updateBadgeBodySchema,
  }),
  badgeController.updateById,
)

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(badgeIdParamSchema, 'params'),
  badgeController.deleteById,
)

router.delete(
  '/:id/soft',
  authenticate,
  requireAdmin,
  validate(badgeIdParamSchema, 'params'),
  badgeController.softDeleteById,
)

router.post(
  '/:id/restore',
  authenticate,
  requireAdmin,
  validate(badgeIdParamSchema, 'params'),
  badgeController.restoreById,
)

export default router
