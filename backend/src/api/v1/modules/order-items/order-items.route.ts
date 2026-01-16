import { Router } from 'express'
import {
  validate,
  validateMultiple,
} from '../../shared/middlewares/validate.middleware'
import { orderItemController } from './order-items.controller'
import {
  orderItemIdParamSchema,
  createOrderItemBodySchema,
  updateOrderItemBodySchema,
  listOrderItemsQuerySchema,
  updateOrderItemVariantBodySchema,
} from './order-items.schema'

const router = Router()

router.get(
  '/',
  validate(listOrderItemsQuerySchema, 'query'),
  orderItemController.findAll,
)

router.get(
  '/:id',
  validate(orderItemIdParamSchema, 'params'),
  orderItemController.findById,
)

router.post(
  '/',
  validate(createOrderItemBodySchema, 'body'),
  orderItemController.create,
)

router.put(
  '/:id',
  validateMultiple({
    params: orderItemIdParamSchema,
    body: updateOrderItemBodySchema,
  }),
  orderItemController.updateById,
)

router.put(
  '/:id/variant',
  validateMultiple({
    params: orderItemIdParamSchema,
    body: updateOrderItemVariantBodySchema,
  }),
  orderItemController.updateItemVariant,
)

router.delete(
  '/:id',
  validate(orderItemIdParamSchema, 'params'),
  orderItemController.deleteById,
)

router.delete(
  '/:id/soft',
  validate(orderItemIdParamSchema, 'params'),
  orderItemController.softDeleteById,
)

router.post(
  '/:id/restore',
  validate(orderItemIdParamSchema, 'params'),
  orderItemController.restore,
)

export default router
