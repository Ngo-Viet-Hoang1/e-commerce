import { Router } from 'express'
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
  validate(createBadgeBodySchema, 'body'),
  badgeController.create,
)

router.put(
  '/:id',
  validateMultiple({
    params: badgeIdParamSchema,
    body: updateBadgeBodySchema,
  }),
  badgeController.updateById,
)

router.delete(
  '/:id',
  validate(badgeIdParamSchema, 'params'),
  badgeController.deleteById,
)

router.delete(
  '/:id/soft',
  validate(badgeIdParamSchema, 'params'),
  badgeController.softDeleteById,
)

router.post(
  '/:id/restore',
  validate(badgeIdParamSchema, 'params'),
  badgeController.restoreById,
)

export default router
