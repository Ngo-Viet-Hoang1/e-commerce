import { Router } from 'express'
import {
  authenticate,
  requireAdmin,
} from '../../shared/middlewares/auth.middleware'
import {
  validate,
  validateMultiple,
} from '../../shared/middlewares/validate.middleware'
import { attributeController } from './attribute.controller'
import {
  attributeIdParamSchema,
  createAttributeBodySchema,
  listAttributesQuerySchema,
  updateAttributeBodySchema,
} from './attribute.schema'

const router = Router()

router.get(
  '/',
  validate(listAttributesQuerySchema, 'query'),
  attributeController.findAll,
)

router.get(
  '/:id',
  validate(attributeIdParamSchema, 'params'),
  attributeController.findById,
)

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createAttributeBodySchema, 'body'),
  attributeController.create,
)

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateMultiple({
    params: attributeIdParamSchema,
    body: updateAttributeBodySchema,
  }),
  attributeController.update,
)

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(attributeIdParamSchema, 'params'),
  attributeController.deleteById,
)

router.delete(
  '/:id/soft',
  authenticate,
  requireAdmin,
  validate(attributeIdParamSchema, 'params'),
  attributeController.softDeleteById,
)

router.post(
  '/:id/restore',
  authenticate,
  requireAdmin,
  validate(attributeIdParamSchema, 'params'),
  attributeController.restore,
)

export default router
