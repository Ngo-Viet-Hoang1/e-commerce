import { Router } from 'express'
import {
  authenticate,
  requireAdmin,
} from '../../shared/middlewares/auth.middleware'
import { validate } from '../../shared/middlewares/validate.middleware'
import { productImageController } from './product-image.controller'
import {
  createProductImageBodySchema,
  listProductImagesQuerySchema,
  productImageIdParamSchema,
} from './product-image.schema'

const router = Router()

router.get(
  '/',
  validate(listProductImagesQuerySchema, 'query'),
  productImageController.findAll,
)

router.get(
  '/:id',
  validate(productImageIdParamSchema, 'params'),
  productImageController.findById,
)

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createProductImageBodySchema, 'body'),
  productImageController.create,
)

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(productImageIdParamSchema, 'params'),
  productImageController.deleteById,
)

router.delete(
  '/:id/soft',
  authenticate,
  requireAdmin,
  validate(productImageIdParamSchema, 'params'),
  productImageController.softDeleteById,
)

router.post(
  '/:id/restore',
  authenticate,
  requireAdmin,
  validate(productImageIdParamSchema, 'params'),
  productImageController.restoreById,
)

export const productImageRouter = router
export default productImageRouter
