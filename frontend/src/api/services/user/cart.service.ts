import type {
  AddToCartInput,
  Cart,
  RemoveCartItemInput,
  UpdateCartItemInput,
} from '@/interfaces/cart.interface'
import type { IApiResponse } from '@/interfaces/base-response.interface'
import { api } from '../..'

class CartService {
  static getCart = async () => {
    const { data } = await api.get<IApiResponse<Cart>>('/cart')
    return data
  }

  static addToCart = async (input: AddToCartInput) => {
    const { data } = await api.post<IApiResponse<Cart>>('/cart/items', input)
    return data
  }

  static updateCartItem = async (
    productId: number,
    variantId: number,
    input: UpdateCartItemInput,
  ) => {
    const { data } = await api.put<IApiResponse<Cart>>(
      `/cart/items?productId=${productId}&variantId=${variantId}`,
      input,
    )
    return data
  }

  static removeCartItem = async (input: RemoveCartItemInput) => {
    const { data } = await api.delete<IApiResponse<Cart>>('/cart/items', {
      data: input,
    })
    return data
  }

  static removeCartItems = async (
    items: { productId: number; variantId: number }[],
  ) => {
    const { data } = await api.delete<IApiResponse<Cart>>('/cart/items/bulk', {
      data: { items },
    })
    return data
  }

  static clearCart = async () => {
    const { data } = await api.delete<IApiResponse<null>>('/cart')
    return data
  }
}

export default CartService
