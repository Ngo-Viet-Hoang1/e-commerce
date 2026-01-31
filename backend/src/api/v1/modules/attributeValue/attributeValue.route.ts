import { Router } from 'express'
import {
  authenticate,
  requireAdmin,
} from '../../shared/middlewares/auth.middleware'
import {
  validate,
  validateMultiple,
} from '../../shared/middlewares/validate.middleware'
import { attributeValueController } from './attributeValue.controller'
import {
  attributeValueIdParamSchema,
  createAttributeValueBodySchema,
  listAttributeValuesQuery,
  updateAttributeValueBodySchema,
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
  authenticate,
  requireAdmin,
  validate(createAttributeValueBodySchema, 'body'),
  attributeValueController.create,
)

router.put(
  '/:attributeId/values/:id',
  authenticate,
  requireAdmin,
  validateMultiple({
    params: attributeValueIdParamSchema,
    body: updateAttributeValueBodySchema,
  }),
  attributeValueController.update,
)

router.delete(
  '/:attributeId/values/:id/soft',
  authenticate,
  requireAdmin,
  validate(attributeValueIdParamSchema, 'params'),
  attributeValueController.softDeleteById,
)

router.delete(
  '/:attributeId/values/:id',
  authenticate,
  requireAdmin,
  validate(attributeValueIdParamSchema, 'params'),
  attributeValueController.deleteById,
)

router.post(
  '/:attributeId/values/:id/restore',
  authenticate,
  requireAdmin,
  validate(attributeValueIdParamSchema, 'params'),
  attributeValueController.restore,
)

export default router
