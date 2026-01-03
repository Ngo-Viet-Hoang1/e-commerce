import type { Prisma } from '@generated/prisma/client'
import { NotFoundException } from '../../shared/models/app-error.model'
import { orderRepository } from './order.repository'
import {
  type CreateOrderBody,
  type UpdateOrderBody,
  type listOrdersQuerySchema,
} from './order.schema'

class OrderService {
  findAll = async (query: listOrdersQuerySchema) => {
    const { page, limit, sort, order, search } = query

    const where: Prisma.OrderWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          ...(Number.isInteger(Number(search))
            ? [{ orderId: Number(search) }]
            : []),
          {
            user: {
              email: { contains: search, mode: 'insensitive' },
            },
          },
          {
            user: {
              name: { contains: search, mode: 'insensitive' },
            },
          },
          { shippingRecipientName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [orders, total] = await Promise.all([
      orderRepository.findMany({
        where,
        orderBy: { [sort || 'created_at']: order || 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      orderRepository.count(where),
    ])

    return { orders, total, page, limit }
  }

  findById = async (id: number) => {
    const order = await orderRepository.findById(id)

    if (!order) {
      throw new NotFoundException('Order', id.toString())
    }

    return order
  }

  create = async (data: CreateOrderBody) => {
    const {
      items,
      shippingAddress,
      billingAddress,
      metadata,
      shippingFee = 0,
      ...rest
    } = data

    const { productVariantRepository } =
      await import('../product-variant/product-variant.repository')
    const { prisma } = await import('../../shared/config/database/postgres')

    const itemsData = await Promise.all(
      items.map(async (item) => {
        const variant = await productVariantRepository.findById(item.variantId)

        if (!variant) {
          throw new NotFoundException('Variant', item.variantId.toString())
        }

        if (variant.productId !== item.productId) {
          throw new NotFoundException('Variant does not belong to product')
        }

        const unitPrice = variant.price
        const totalPrice =
          unitPrice.toNumber() * item.quantity - (item.discount || 0)

        return {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
          discount: item.discount || 0,
        }
      }),
    )

    const itemsTotal = itemsData.reduce((sum, item) => sum + item.totalPrice, 0)
    const totalAmount = itemsTotal + shippingFee

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          ...rest,
          totalAmount,
          shippingFee,
          shippingAddress: shippingAddress ?? undefined,
          billingAddress: billingAddress ?? undefined,
          metadata: metadata ?? undefined,
          orderItems: {
            create: itemsData,
          },
        },
        include: {
          orderItems: true,
        },
      })

      return newOrder
    })

    return order
  }

  updateById = async (id: number, data: UpdateOrderBody) => {
    await this.findById(id)

    const updateData: Prisma.OrderUpdateInput = {
      ...data,
    }

    if (data.status === 'delivered') {
      updateData.deliveredAt = new Date()
    }

    const updatedOrder = await orderRepository.update(id, updateData)

    return updatedOrder
  }

  deleteById = async (id: number) => {
    await this.findById(id)

    const deletedOrder = await orderRepository.deleteById(id)

    return deletedOrder
  }

  softDeleteById = async (id: number) => {
    await this.findById(id)
    const deletedOrder = await orderRepository.softDelete(id)

    return deletedOrder
  }
  restoreById = async (id: number) => {
    await this.findById(id)
    const restoredOrder = await orderRepository.restore(id)

    return restoredOrder
  }

  findUserOrders = async (userId: number, query: listOrdersQuerySchema) => {
    const { page, limit } = query

    const [orders, total] = await Promise.all([
      orderRepository.findManyForUser(userId, {
        skip: (page - 1) * limit,
        take: limit,
      }),
      orderRepository.countForUser(userId),
    ])

    return { orders, total, page, limit }
  }

  findUserOrderById = async (userId: number, orderId: number) => {
    const order = await orderRepository.findByIdForUser(orderId, userId)

    if (!order) {
      throw new NotFoundException('Order', orderId.toString())
    }

    return order
  }

  cancelUserOrder = async (userId: number, orderId: number) => {
    const order = await this.findUserOrderById(userId, orderId)

    // Only allow cancellation if order is pending or processing
    if (!['pending', 'processing'].includes(order.status)) {
      throw new NotFoundException('Order', orderId.toString())
    }

    const cancelledOrder = await orderRepository.update(orderId, {
      status: 'cancelled',
    })

    return cancelledOrder
  }
}

export const orderService = new OrderService()
export default OrderService
