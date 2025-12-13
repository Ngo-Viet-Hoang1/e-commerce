import { Router } from 'express'
import {
  validate,
  validateMultiple,
} from '../../shared/middlewares/validate.middleware'
import { attributeValueController } from './attributeValue.controller'
import {
  attributeValueIdParamSchema,
  createAttributeValueBodySchema,
  updateAttributeValueBodySchema,
  listAttributeValuesQuery,
} from './attributeValue.schema'

const router = Router()

router.get(
  '/:attributeId/values',
  validate(listAttributeValuesQuery, 'query'),
  attributeValueController.findAll,
)

router.get(
  '/:attributeId/values/:id',
  validate(attributeValueIdParamSchema, 'params'),
  attributeValueController.findById,
)

router.post(
  '/:attributeId/values',
  validate(createAttributeValueBodySchema, 'body'),
  attributeValueController.create,
)

router.put(
  '/:attributeId/values/:id',
  validateMultiple({
    params: attributeValueIdParamSchema,
    body: updateAttributeValueBodySchema,
  }),
  attributeValueController.update,
)

router.delete(
  '/:attributeId/values/:id/soft',
  validate(attributeValueIdParamSchema, 'params'),
  attributeValueController.softDeleteById,
)

router.delete(
  '/:attributeId/values/:id',
  validate(attributeValueIdParamSchema, 'params'),
  attributeValueController.deleteById,
)

router.post(
  '/:attributeId/values/:id/restore',
  validate(attributeValueIdParamSchema, 'params'),
  attributeValueController.restore,
)

export default router
