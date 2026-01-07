import { Router } from 'express'
import { authenticate } from '../../shared/middlewares/auth.middleware'
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
  userOrderIdParamSchema,
} from './order.schema'

const router = Router()

router.get(
  '/user/orders',
  authenticate,
  validate(listOrdersQuerySchema, 'query'),
  orderController.findUserOrders,
)

router.get(
  '/user/orders/:orderId',
  authenticate,
  validate(userOrderIdParamSchema, 'params'),
  orderController.findUserOrderById,
)

router.post(
  '/user/orders',
  authenticate,
  validate(createOrderBodySchema, 'body'),
  orderController.createUserOrder,
)

router.post(
  '/user/orders/:orderId/cancel',
  authenticate,
  validate(userOrderIdParamSchema, 'params'),
  orderController.cancelUserOrder,
)

router.get(
  '/user/orders/:orderId/pdf',
  authenticate,
  validate(userOrderIdParamSchema, 'params'),
  orderController.exportUserOrderPDF,
)

router.get(
  '/',
  validate(listOrdersQuerySchema, 'query'),
  orderController.findAll,
)

router.get(
  '/:id',
  validate(orderIdParamSchema, 'params'),
  orderController.findById,
)

router.get(
  '/:id/export-pdf',
  validate(orderIdParamSchema, 'params'),
  orderController.exportOrderPDF,
)

router.post(
  '/',
  validate(createOrderBodySchema, 'body'),
  orderController.create,
)

router.put(
  '/:id',
  validateMultiple({
    params: orderIdParamSchema,
    body: updateOrderBodySchema,
  }),
  orderController.updateById,
)

router.delete(
  '/:id',
  validate(orderIdParamSchema, 'params'),
  orderController.deleteById,
)

router.delete(
  '/:id/soft',
  validate(orderIdParamSchema, 'params'),
  orderController.softDeleteById,
)

router.post(
  '/:id/restore',
  validate(orderIdParamSchema, 'params'),
  orderController.restoreById,
)
export default router
