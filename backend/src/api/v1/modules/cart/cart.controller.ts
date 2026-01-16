import type { Request, Response } from 'express'
import { BadRequestException } from '../../shared/models/app-error.model'
import { SuccessResponse } from '../../shared/models/success-response.model'
import type {
  AddToCartBody,
  RemoveCartItemBody,
  RemoveCartItemsBody,
  UpdateCartItemBody,
} from './cart.schema'
import { cartService } from './cart.service'

class CartController {
  getCart = async (req: Request, res: Response) => {
    const userId = req.user!.id

    const cart = await cartService.getCart(userId)

    SuccessResponse.send(res, cart, 'Cart retrieved successfully')
  }

  addToCart = async (req: Request, res: Response) => {
    const userId = req.user!.id
    const data = req.validatedData?.body as AddToCartBody

    const cart = await cartService.addToCart(data, userId)

    SuccessResponse.send(res, cart, 'Item added to cart successfully')
  }

  updateCartItem = async (req: Request, res: Response) => {
    const userId = req.user!.id
    const { productId, variantId } = req.query
    const data = req.validatedData?.body as UpdateCartItemBody

    if (!productId || !variantId) {
      throw new BadRequestException('productId and variantId are required')
    }

    const cart = await cartService.updateCartItem(
      Number(productId),
      Number(variantId),
      data,
      userId,
    )

    SuccessResponse.send(res, cart, 'Cart item updated successfully')
  }

  removeCartItem = async (req: Request, res: Response) => {
    const userId = req.user!.id
    const data = req.validatedData?.body as RemoveCartItemBody

    const cart = await cartService.removeCartItem(
      data.productId,
      data.variantId,
      userId,
    )

    SuccessResponse.send(res, cart, 'Item removed from cart successfully')
  }

  removeCartItems = async (req: Request, res: Response) => {
    const userId = req.user!.id
    const data = req.validatedData?.body as RemoveCartItemsBody

    const cart = await cartService.removeCartItems(data.items, userId)

    SuccessResponse.send(
      res,
      cart,
      `${data.items.length} item(s) removed from cart successfully`,
    )
  }

  clearCart = async (req: Request, res: Response) => {
    const userId = req.user!.id

    await cartService.clearCart(userId)

    SuccessResponse.send(res, null, 'Cart cleared successfully')
  }
}

export const cartController = new CartController()
export default CartController
