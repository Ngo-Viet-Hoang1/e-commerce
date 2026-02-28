import { Router } from 'express'
import { authenticate } from '../../shared/middlewares/auth.middleware'
import { validate } from '../../shared/middlewares/validate.middleware'
import { orderController } from './order.controller'
import {
  createOrderBodySchema,
  listOrdersQuerySchema,
  userOrderIdParamSchema,
} from './order.schema'

const router = Router()

router.get(
  '/',
  authenticate,
  validate(listOrdersQuerySchema, 'query'),
  orderController.findUserOrders,
)

router.get(
  '/:orderId',
  authenticate,
  validate(userOrderIdParamSchema, 'params'),
  orderController.findUserOrderById,
)

router.post(
  '/',
  authenticate,
  validate(createOrderBodySchema, 'body'),
  orderController.createUserOrder,
)

router.post(
  '/:orderId/cancel',
  authenticate,
  validate(userOrderIdParamSchema, 'params'),
  orderController.cancelUserOrder,
)

router.get(
  '/:orderId/pdf',
  authenticate,
  validate(userOrderIdParamSchema, 'params'),
  orderController.exportUserOrderPDF,
)

export default router
