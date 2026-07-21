import { Router } from 'express'
import {
  authenticate,
  requireAdmin,
} from '../../shared/middlewares/auth.middleware'
import { validate } from '../../shared/middlewares/validate.middleware'
import { productVideoController } from './product-video.controller'
import {
  createProductVideoBodySchema,
  listProductVideosQuerySchema,
  productVideoIdParamSchema,
} from './product-video.schema'

const router = Router()

router.get(
  '/',
  validate(listProductVideosQuerySchema, 'query'),
  productVideoController.findAll,
)

router.get(
  '/:id',
  validate(productVideoIdParamSchema, 'params'),
  productVideoController.findById,
)

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createProductVideoBodySchema, 'body'),
  productVideoController.create,
)

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(productVideoIdParamSchema, 'params'),
  productVideoController.deleteById,
)

router.delete(
  '/:id/soft',
  authenticate,
  requireAdmin,
  validate(productVideoIdParamSchema, 'params'),
  productVideoController.softDeleteById,
)

router.post(
  '/:id/restore',
  authenticate,
  requireAdmin,
  validate(productVideoIdParamSchema, 'params'),
  productVideoController.restoreById,
)

export const productVideoRouter = router
export default productVideoRouter
