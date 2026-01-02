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
    const { shippingAddress, billingAddress, metadata, ...rest } = data

    const order = await orderRepository.create({
      ...rest,
      shippingAddress: shippingAddress ?? undefined,
      billingAddress: billingAddress ?? undefined,
      metadata: metadata ?? undefined,
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
}

export const orderService = new OrderService()
export default OrderService
