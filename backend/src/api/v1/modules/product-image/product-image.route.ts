import { Router } from 'express'
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
  validate(createProductImageBodySchema, 'body'),
  productImageController.create,
)
router.delete(
  '/:id',
  validate(productImageIdParamSchema, 'params'),
  productImageController.deleteById,
)
router.delete(
  '/:id/soft',
  validate(productImageIdParamSchema, 'params'),
  productImageController.softDeleteById,
)

router.post(
  '/:id/restore',
  validate(productImageIdParamSchema, 'params'),
  productImageController.restoreById,
)

export const productImageRouter = router
export default productImageRouter
