import { Router } from 'express'
import {
  validate,
  validateMultiple,
} from '../../shared/middlewares/validate.middleware'
import { orderController } from './order.controller'
import {
  createOrderBodySchema,
  listOrdersQuerySchema,
  updateOrderBodySchema,
  orderIdParamSchema,
} from './order.schema'

const router = Router()

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
