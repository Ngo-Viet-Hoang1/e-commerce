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

router.use(authenticate, requireAdmin)

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
  orderController.createAdminOrder,
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
