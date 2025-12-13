import { Router } from 'express'
import {
  validate,
  validateMultiple,
} from '../../shared/middlewares/validate.middleware'
import { productController } from './product.controller'
import {
  createProductBodySchema,
  listProductsQuerySchema,
  productIdParamSchema,
} from './product.schema'

const router = Router()

router.get(
  '/',
  validate(listProductsQuerySchema, 'query'),
  productController.findAll,
)

router.get(
  '/:id',
  validate(productIdParamSchema, 'params'),
  productController.findById,
)

router.get(
  '/sku/:sku',
  validate(productIdParamSchema, 'params'),
  productController.findBySku,
)

router.post(
  '/',
  validate(createProductBodySchema, 'body'),
  productController.create,
)

router.put(
  '/:id',
  validateMultiple({
    params: productIdParamSchema,
    body: createProductBodySchema,
  }),
  productController.updateById,
)

router.delete(
  '/:id',
  validate(productIdParamSchema, 'params'),
  productController.deleteById,
)

router.delete(
  '/:id/soft',
  validate(productIdParamSchema, 'params'),
  productController.softDeleteById,
)

router.post(
  '/:id/restore',
  validate(productIdParamSchema, 'params'),
  productController.restoreById,
)

export default router
