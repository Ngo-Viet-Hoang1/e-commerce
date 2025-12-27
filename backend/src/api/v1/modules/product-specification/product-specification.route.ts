import { Router } from 'express'
import {
  validate,
  validateMultiple,
} from '../../shared/middlewares/validate.middleware'
import { productSpecificationController } from './product-secification.controller'

import {
  createProductSpecificationBodySchema,
  listProductSpecificationsQuerySchema,
  productSpecificationIdParamSchema,
  updateProductSpecificationBodySchema,
  getByProductIdParamSchema,
  createMultipleByProductIdBodySchema,
} from './product-specification.schema'

const router = Router()

router.get(
  '/',
  validate(listProductSpecificationsQuerySchema, 'query'),
  productSpecificationController.findAll,
)

router.get(
  '/:id',
  validate(productSpecificationIdParamSchema, 'params'),
  productSpecificationController.findById,
)

router.post(
  '/',
  validate(createProductSpecificationBodySchema, 'body'),
  productSpecificationController.create,
)

router.put(
  '/:id',
  validateMultiple({
    params: productSpecificationIdParamSchema,
    body: updateProductSpecificationBodySchema,
  }),
  productSpecificationController.updateById,
)

router.delete(
  '/:id',
  validate(productSpecificationIdParamSchema, 'params'),
  productSpecificationController.deleteById,
)

router.delete(
  '/:id/soft',
  validate(productSpecificationIdParamSchema, 'params'),
  productSpecificationController.softDeleteById,
)

router.post(
  '/:id/restore',
  validate(productSpecificationIdParamSchema, 'params'),
  productSpecificationController.restoreById,
)

router.get(
  '/:productId/specifications',
  validate(getByProductIdParamSchema, 'params'),
  productSpecificationController.findAllByProductId,
)

router.post(
  '/:productId/specifications',
  validateMultiple({
    params: getByProductIdParamSchema,
    body: createMultipleByProductIdBodySchema,
  }),
  productSpecificationController.createMultipleByProductId,
)

export default router
