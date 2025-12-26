import { Router } from 'express'
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
  validate(createProductVideoBodySchema, 'body'),
  productVideoController.create,
)

router.delete(
  '/:id',
  validate(productVideoIdParamSchema, 'params'),
  productVideoController.deleteById,
)

router.delete(
  '/:id/soft',
  validate(productVideoIdParamSchema, 'params'),
  productVideoController.softDeleteById,
)

router.post(
  '/:id/restore',
  validate(productVideoIdParamSchema, 'params'),
  productVideoController.restoreById,
)

export const productVideoRouter = router
export default productVideoRouter
