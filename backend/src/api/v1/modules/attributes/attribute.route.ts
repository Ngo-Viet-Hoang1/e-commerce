import { Router } from 'express'
import {
  validate,
  validateMultiple,
} from '../../shared/middlewares/validate.middleware'
import { attributeController } from './attribute.controller'
import {
  attributeIdParamSchema,
  createAttributeBodySchema,
  updateAttributeBodySchema,
  listAttributesQuerySchema,
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
  validate(createAttributeBodySchema, 'body'),
  attributeController.create,
)

router.put(
  '/:id',
  validateMultiple({
    params: attributeIdParamSchema,
    body: updateAttributeBodySchema,
  }),
  attributeController.update,
)

router.delete(
  '/:id',
  validate(attributeIdParamSchema, 'params'),
  attributeController.deleteById,
)

router.delete(
  '/:id/soft',
  validate(attributeIdParamSchema, 'params'),
  attributeController.softDeleteById,
)

router.post(
  '/:id/restore',
  validate(attributeIdParamSchema, 'params'),
  attributeController.restore,
)

export default router
