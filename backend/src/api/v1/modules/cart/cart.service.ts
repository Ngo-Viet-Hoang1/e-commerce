import {
  BadRequestException,
  NotFoundException,
} from '../../shared/models/app-error.model'
import redis from '../../shared/config/database/redis'
import { cartRepository } from './cart.repo'
import type { AddToCartBody, CartDto, UpdateCartItemBody } from './cart.schema'

const CART_TTL = 30 * 24 * 60 * 60 // 30 days

interface CartItem {
  productId: number
  variantId: number
  quantity: number
  price: number
  addedAt: string
}

interface CartData {
  items: CartItem[]
  updatedAt: string
}

class CartService {
  private getCartKey(userId: number): string {
    return `cart:user:${userId}`
  }

  private async getCartFromRedis(userId: number): Promise<CartData> {
    const key = this.getCartKey(userId)
    const data = await redis.get(key)

    if (!data) {
      return { items: [], updatedAt: new Date().toISOString() }
    }

    return JSON.parse(data) as CartData
  }

  private async saveCartToRedis(cart: CartData, userId: number): Promise<void> {
    const key = this.getCartKey(userId)
    cart.updatedAt = new Date().toISOString()
    await redis.setex(key, CART_TTL, JSON.stringify(cart))
  }

  private async populateCartItems(items: CartItem[]): Promise<CartDto> {
    if (items.length === 0) {
      return {
        items: [],
        summary: {
          itemCount: 0,
          totalQuantity: 0,
          subtotal: 0,
          hasPriceChanges: false,
          hasOutOfStock: false,
        },
        updatedAt: new Date().toISOString(),
      }
    }

    const variantIds = [...new Set(items.map((item) => item.variantId))]
    const variants = await cartRepository.getVariantsByIds(variantIds)
    const variantMap = new Map(variants.map((v) => [v.id, v]))

    const populatedItems = items
      .map((item) => {
        const variant = variantMap.get(item.variantId)
        if (!variant || variant.product.deletedAt) return null

        const currentPrice = Number(variant.price)
        const image = variant.product.productImages[0]?.url || null

        return {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          currentPrice,
          priceChanged: currentPrice !== item.price,
          product: {
            id: variant.product.id,
            name: variant.product.name,
            sku: variant.product.sku,
            image,
            status: variant.product.status,
          },
          variant: {
            id: variant.id,
            title: variant.title,
            sku: variant.sku,
            price: currentPrice,
            stockQuantity: variant.stockQuantity,
            isDefault: variant.isDefault,
          },
          subtotal: currentPrice * item.quantity,
          addedAt: item.addedAt,
        }
      })
      .filter((item) => item !== null)

    const summary = {
      itemCount: populatedItems.length,
      totalQuantity: populatedItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      ),
      subtotal: populatedItems.reduce((sum, item) => sum + item.subtotal, 0),
      hasPriceChanges: populatedItems.some((item) => item.priceChanged),
      hasOutOfStock: populatedItems.some(
        (item) => item.quantity > item.variant.stockQuantity,
      ),
    }

    return {
      items: populatedItems,
      summary,
      updatedAt: new Date().toISOString(),
    }
  }

  getCart = async (userId: number): Promise<CartDto> => {
    const cart = await this.getCartFromRedis(userId)

    // Refresh TTL
    if (cart.items.length > 0) {
      await redis.expire(this.getCartKey(userId), CART_TTL)
    }

    return this.populateCartItems(cart.items)
  }

  addToCart = async (data: AddToCartBody, userId: number): Promise<CartDto> => {
    // Validate variant
    const variant = await cartRepository.getProductVariant(
      data.productId,
      data.variantId,
    )

    if (!variant || variant.product.deletedAt) {
      throw new NotFoundException('Product variant not found')
    }

    if (variant.product.status !== 'active') {
      throw new BadRequestException('Product is not available')
    }

    const currentPrice = Number(variant.price)
    const availableStock = variant.stockQuantity

    if (availableStock < data.quantity) {
      throw new BadRequestException(
        `Not enough stock. Available: ${availableStock}`,
      )
    }

    // Get cart
    const cart = await this.getCartFromRedis(userId)

    // Find existing item
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.productId === data.productId && item.variantId === data.variantId,
    )

    if (existingIndex !== -1) {
      const existingItem = cart.items[existingIndex]!
      const newQuantity = existingItem.quantity + data.quantity

      if (newQuantity > availableStock) {
        throw new BadRequestException(
          `Cannot add ${data.quantity} more. Max stock: ${availableStock}`,
        )
      }

      existingItem.quantity = newQuantity
      existingItem.price = currentPrice
    } else {
      cart.items.push({
        productId: data.productId,
        variantId: data.variantId,
        quantity: data.quantity,
        price: currentPrice,
        addedAt: new Date().toISOString(),
      })
    }

    await this.saveCartToRedis(cart, userId)
    return this.populateCartItems(cart.items)
  }

  updateCartItem = async (
    productId: number,
    variantId: number,
    data: UpdateCartItemBody,
    userId: number,
  ): Promise<CartDto> => {
    const cart = await this.getCartFromRedis(userId)

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId && item.variantId === variantId,
    )

    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart')
    }

    if (data.quantity === 0) {
      cart.items.splice(itemIndex, 1)
    } else {
      // Validate stock
      const variant = await cartRepository.getProductVariant(
        productId,
        variantId,
      )

      if (!variant || variant.product.deletedAt) {
        throw new NotFoundException('Product variant not found')
      }

      if (data.quantity > variant.stockQuantity) {
        throw new BadRequestException(
          `Not enough stock. Available: ${variant.stockQuantity}`,
        )
      }

      const currentItem = cart.items[itemIndex]!
      currentItem.quantity = data.quantity
      currentItem.price = Number(variant.price)
    }

    await this.saveCartToRedis(cart, userId)
    return this.populateCartItems(cart.items)
  }

  removeCartItem = async (
    productId: number,
    variantId: number,
    userId: number,
  ): Promise<CartDto> => {
    const cart = await this.getCartFromRedis(userId)

    cart.items = cart.items.filter(
      (item) => !(item.productId === productId && item.variantId === variantId),
    )

    await this.saveCartToRedis(cart, userId)
    return this.populateCartItems(cart.items)
  }

  clearCart = async (userId: number): Promise<void> => {
    await redis.del(this.getCartKey(userId))
  }
}

export const cartService = new CartService()
export default CartService
