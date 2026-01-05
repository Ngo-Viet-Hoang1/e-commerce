import { Router } from 'express'
import { authenticate } from '../../shared/middlewares/auth.middleware'
import { validate } from '../../shared/middlewares/validate.middleware'
import { cartController } from './cart.controller'
import {
  addToCartBodySchema,
  removeCartItemBodySchema,
  updateCartItemBodySchema,
} from './cart.schema'

const router = Router()

router.use(authenticate)

router.get('/', cartController.getCart)

router.post(
  '/items',
  validate(addToCartBodySchema, 'body'),
  cartController.addToCart,
)

router.put(
  '/items',
  validate(updateCartItemBodySchema, 'body'),
  cartController.updateCartItem,
)

router.delete(
  '/items',
  validate(removeCartItemBodySchema, 'body'),
  cartController.removeCartItem,
)

router.delete('/', cartController.clearCart)

export default router
