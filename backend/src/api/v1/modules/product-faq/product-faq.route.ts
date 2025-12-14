import { Router } from 'express'
import {
  validate,
  validateMultiple,
} from '../../shared/middlewares/validate.middleware'
import { productFaqController } from './product-faq.controller'
import {
  createProductFaqBodySchema,
  listProductFaqsQuerySchema,
  productFaqIdParamSchema,
  updateProductFaqBodySchema,
} from './product-faq.schema'

const router = Router()

router.get(
  '/',
  validate(listProductFaqsQuerySchema, 'query'),
  productFaqController.findAll,
)

router.get(
  '/:id',
  validate(productFaqIdParamSchema, 'params'),
  productFaqController.findById,
)

router.post(
  '/',
  validate(createProductFaqBodySchema, 'body'),
  productFaqController.create,
)

router.put(
  '/:id',
  validateMultiple({
    params: productFaqIdParamSchema,
    body: updateProductFaqBodySchema,
  }),
  productFaqController.updatebyId,
)

router.delete(
  '/:id',
  validate(productFaqIdParamSchema, 'params'),
  productFaqController.deleteById,
)

router.delete(
  '/:id/soft',
  validate(productFaqIdParamSchema, 'params'),
  productFaqController.softDeleteById,
)

router.post(
  '/:id/restore',
  validate(productFaqIdParamSchema, 'params'),
  productFaqController.restoreById,
)

export default router
