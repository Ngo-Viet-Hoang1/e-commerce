import type { Prisma } from '@generated/prisma/client'
import { productVariantRepository } from '../../modules/product-variant/product-variant.repository'
import {
  ConflictException,
  NotFoundException,
} from '../../shared/models/app-error.model'
import { normalizeJsonInput } from '../../shared/utils'
import { orderItemRepository } from './order-items.repository'
import {
  type CreateOrderItemBody,
  type ListOrderItemsQuery,
  type updateOrderItemBody,
} from './order-items.schema'

class OrderItemService {
  findAll = async (query: ListOrderItemsQuery) => {
    const {
      page,
      limit,
      sort,
      order,

      orderId,
      productId,
      variantId,
      minQuantity,
      maxQuantity,
    } = query

    const where: Prisma.OrderItemWhereInput = {
      deletedAt: null,

      ...(orderId && { orderId }),
      ...(productId && { productId }),
      ...(variantId && { variantId }),

      ...((minQuantity || maxQuantity) && {
        quantity: {
          ...(minQuantity && { gte: minQuantity }),
          ...(maxQuantity && { lte: maxQuantity }),
        },
      }),
    }

    const [items, total] = await Promise.all([
      orderItemRepository.findMany({
        where,
        orderBy: {
          [sort || 'createdAt']: order || 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      orderItemRepository.count(where),
    ])

    return {
      items,
      total,
      page,
      limit,
    }
  }

  findById = async (id: number) => {
    const orderItem = await orderItemRepository.findById(id)

    if (!orderItem) {
      throw new NotFoundException('OrderItem', id.toString())
    }

    return orderItem
  }

  create = async (data: CreateOrderItemBody) => {
    const { orderId, productId, variantId, discount = 0, ...createData } = data

    const variant = await productVariantRepository.findById(variantId)

    if (!variant) {
      throw new NotFoundException('Variant not found')
    }

    if (variant.productId !== productId) {
      throw new ConflictException('Variant does not belong to the product')
    }

    const unitPrice = variant.price
    const totalPrice = unitPrice.toNumber() * createData.quantity - discount

    const orderItem = await orderItemRepository.create({
      ...createData,
      discount,
      unitPrice,
      totalPrice,
      metadata: normalizeJsonInput(createData.metadata),
      product: { connect: { id: productId } },
      order: { connect: { orderId } },
      variant: { connect: { id: variantId } },
    })
    return orderItem
  }

  updateOrderItemVariant = async (
    orderItemId: number,
    newVariantId: number,
  ) => {
    const item = await orderItemRepository.findByIdWithOrderStatus(orderItemId)

    if (!item) {
      throw new NotFoundException('Order item not found')
    }

    if (item.order.status !== 'CONFIRMED') {
      throw new ConflictException('Cannot change variant after shipping')
    }

    const variant = await productVariantRepository.findById(newVariantId)

    if (!variant) {
      throw new NotFoundException('Variant not found')
    }

    if (variant.stockQuantity < item.quantity) {
      throw new ConflictException('Variant out of stock')
    }

    const unitPrice = variant.price

    return orderItemRepository.update(orderItemId, {
      variant: { connect: { id: newVariantId } },
      unitPrice,
      totalPrice:
        unitPrice.toNumber() * item.quantity - item.discount.toNumber(),
    })
  }

  updateById = async (id: number, data: updateOrderItemBody) => {
    await this.findById(id)

    const updateOrderItem = await orderItemRepository.update(id, {
      ...data,
      metadata: normalizeJsonInput(data.metadata),
    })

    return updateOrderItem
  }

  deleteById = async (id: number) => {
    await this.findById(id)

    const deletedOrderItem = await orderItemRepository.delete(id)

    return deletedOrderItem
  }

  softDeleteById = async (id: number) => {
    await this.findById(id)

    const deletedOrderItem = await orderItemRepository.softDelete(id)

    return deletedOrderItem
  }

  restoreById = async (id: number) => {
    const item = await orderItemRepository.findById(id, true)

    if (!item) {
      throw new NotFoundException('Order item not found')
    }

    const restoredOrderItem = await orderItemRepository.restore(id)

    return restoredOrderItem
  }
}

export const orderItemService = new OrderItemService()
