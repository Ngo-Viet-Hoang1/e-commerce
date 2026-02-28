import { Router } from 'express'
import {
  authenticate,
  requireAdmin,
} from '../../shared/middlewares/auth.middleware'
import {
  validate,
  validateMultiple,
} from '../../shared/middlewares/validate.middleware'
import { orderController } from './order.controller'
import {
  createOrderBodySchema,
  listOrdersQuerySchema,
  orderIdParamSchema,
  updateOrderBodySchema,
} from './order.schema'

const router = Router()

router.get(
  '/',
  authenticate,
  requireAdmin,
  validate(listOrdersQuerySchema, 'query'),
  orderController.findAll,
)

router.get(
  '/:id',
  authenticate,
  requireAdmin,
  validate(orderIdParamSchema, 'params'),
  orderController.findById,
)

router.get(
  '/:id/export-pdf',
  authenticate,
  requireAdmin,
  validate(orderIdParamSchema, 'params'),
  orderController.exportOrderPDF,
)

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createOrderBodySchema, 'body'),
  orderController.create,
)

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateMultiple({
    params: orderIdParamSchema,
    body: updateOrderBodySchema,
  }),
  orderController.updateById,
)

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(orderIdParamSchema, 'params'),
  orderController.deleteById,
)

router.delete(
  '/:id/soft',
  authenticate,
  requireAdmin,
  validate(orderIdParamSchema, 'params'),
  orderController.softDeleteById,
)

router.post(
  '/:id/restore',
  authenticate,
  requireAdmin,
  validate(orderIdParamSchema, 'params'),
  orderController.restoreById,
)

export default router
