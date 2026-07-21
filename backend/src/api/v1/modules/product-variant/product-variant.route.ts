import { Router } from 'express'
import {
  authenticate,
  requireAdmin,
} from '../../shared/middlewares/auth.middleware'
import {
  validate,
  validateMultiple,
} from '../../shared/middlewares/validate.middleware'
import { productVariantController } from './product-variant.controller'
import {
  createProductVariantBodySchema,
  listProductVariantsQuerySchema,
  productVariantIdParamSchema,
  updateProductVariantBodySchema,
} from './product-variant.schema'

const router = Router()

router.get(
  '/',
  validate(listProductVariantsQuerySchema, 'query'),
  productVariantController.findAll,
)

router.get(
  '/:id',
  validate(productVariantIdParamSchema, 'params'),
  productVariantController.findById,
)

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createProductVariantBodySchema, 'body'),
  productVariantController.create,
)

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateMultiple({
    params: productVariantIdParamSchema,
    body: updateProductVariantBodySchema,
  }),
  productVariantController.updateById,
)

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(productVariantIdParamSchema, 'params'),
  productVariantController.deleteById,
)

router.delete(
  '/:id/soft',
  authenticate,
  requireAdmin,
  validate(productVariantIdParamSchema, 'params'),
  productVariantController.softDeleteById,
)

router.post(
  '/:id/restore',
  authenticate,
  requireAdmin,
  validate(productVariantIdParamSchema, 'params'),
  productVariantController.restoreById,
)

export default router
