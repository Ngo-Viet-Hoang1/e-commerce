import { Router } from 'express'
import { authenticate } from '../../shared/middlewares/auth.middleware'
import {
  validate,
  validateMultiple,
} from '../../shared/middlewares/validate.middleware'
import { orderController } from '../order/order.controller'
import {
  listOrdersQuerySchema,
  userOrderIdParamSchema,
} from '../order/order.schema'
import { userController } from './user.controller'
import {
  createUserBodySchema,
  listUsersQuerySchema,
  updateUserBodySchema,
  userIdParamSchema,
} from './user.schema'

const router = Router()
router.use(authenticate)
// router.use(autoAuthorize(RESOURCES.USER))

router.get(
  '/orders',
  validate(listOrdersQuerySchema, 'query'),
  orderController.findUserOrders,
)

router.get(
  '/orders/:orderId',
  validate(userOrderIdParamSchema, 'params'),
  orderController.findUserOrderById,
)

router.put(
  '/orders/:orderId/cancel',
  validate(userOrderIdParamSchema, 'params'),
  orderController.cancelUserOrder,
)

router.get('/', validate(listUsersQuerySchema, 'query'), userController.findAll)

router.get(
  '/:id',
  validate(userIdParamSchema, 'params'),
  userController.findById,
)

router.post('/', validate(createUserBodySchema, 'body'), userController.create)

router.put(
  '/:id',
  validateMultiple({
    params: userIdParamSchema,
    body: updateUserBodySchema,
  }),
  userController.updateById,
)

router.delete(
  '/:id',
  validate(userIdParamSchema, 'params'),
  userController.deleteById,
)

router.delete(
  '/:id/soft',
  validate(userIdParamSchema, 'params'),
  userController.softDeleteById,
)

router.post(
  '/:id/restore',
  validate(userIdParamSchema, 'params'),
  userController.restoreById,
)

export default router
