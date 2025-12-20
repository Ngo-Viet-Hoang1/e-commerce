import { Router } from 'express'
import {
  validate,
  validateMultiple,
} from '../../shared/middlewares/validate.middleware'
import { paymentController } from './payment.controller'
import {
  createPaymentBodySchema,
  listPaymentsQuerySchema,
  paymentIdParamSchema,
  updatePaymentBodySchema,
} from './payment.schema'

const router = Router()

router.get(
  '/',
  validate(listPaymentsQuerySchema, 'query'),
  paymentController.findAll,
)

router.get(
  '/:id',
  validate(paymentIdParamSchema, 'params'),
  paymentController.findById,
)

router.post(
  '/',
  validate(createPaymentBodySchema, 'body'),
  paymentController.create,
)

router.put(
  '/:id',
  validateMultiple({
    params: paymentIdParamSchema,
    body: updatePaymentBodySchema,
  }),
  paymentController.updateById,
)

router.delete(
  '/:id',
  validate(paymentIdParamSchema, 'params'),
  paymentController.deleteById,
)

router.delete(
  '/:id/soft',
  validate(paymentIdParamSchema, 'params'),
  paymentController.softDeleteById,
)

router.post(
  '/:id/restore',
  validate(paymentIdParamSchema, 'params'),
  paymentController.restoreById,
)

export default router
