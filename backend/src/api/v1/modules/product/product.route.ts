import { Router } from 'express'
import {
  authenticate,
  requireAdmin,
} from '../../shared/middlewares/auth.middleware'
import {
  validate,
  validateMultiple,
} from '../../shared/middlewares/validate.middleware'
import { productController } from './product.controller'
import {
  createProductBodySchema,
  createSimpleProductBodySchema,
  listProductsQuerySchema,
  productIdParamSchema,
  productSlugParamSchema,
  updateProductBodySchema,
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
  '/slug/:slug',
  validate(productSlugParamSchema, 'params'),
  productController.findBySlug,
)

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createProductBodySchema, 'body'),
  productController.create,
)

router.post(
  '/simple',
  authenticate,
  requireAdmin,
  validate(createSimpleProductBodySchema, 'body'),
  productController.createSimple,
)

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateMultiple({
    params: productIdParamSchema,
    body: updateProductBodySchema,
  }),
  productController.updateById,
)

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(productIdParamSchema, 'params'),
  productController.deleteById,
)

router.delete(
  '/:id/soft',
  authenticate,
  requireAdmin,
  validate(productIdParamSchema, 'params'),
  productController.softDeleteById,
)

router.post(
  '/:id/restore',
  authenticate,
  requireAdmin,
  validate(productIdParamSchema, 'params'),
  productController.restoreById,
)

export default router
