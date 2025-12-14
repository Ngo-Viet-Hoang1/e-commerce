import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

export const ORDER_SELECT_FIELDS = {
  orderId: true,
  userId: true,
  status: true,
  totalAmount: true,
  currency: true,
  shippingAddress: true,
  billingAddress: true,
  shippingMethod: true,
  shippingFee: true,
  paymentStatus: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  placedAt: true,
  deliveredAt: true,
  deletedAt: true,
} as const

class OrderRepository {
  findById = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.order.findUniqueOrThrow({
        where: { orderId: id },
        select: ORDER_SELECT_FIELDS,
      }),
    )
  }

  findMany = async (options?: Prisma.OrderFindManyArgs) => {
    return executePrismaQuery(() =>
      prisma.order.findMany({
        where: { deletedAt: null },
        select: ORDER_SELECT_FIELDS,
        ...options,
      }),
    )
  }

  count = async (where?: Prisma.OrderWhereInput) => {
    return executePrismaQuery(() => prisma.order.count({ where }))
  }

  create = async (data: Prisma.OrderCreateInput) => {
    return executePrismaQuery(() =>
      prisma.order.create({
        data,
        select: ORDER_SELECT_FIELDS,
      }),
    )
  }

  update = async (id: number, data: Prisma.OrderUpdateInput) => {
    return executePrismaQuery(() =>
      prisma.order.update({
        where: { orderId: id },
        data,
        select: ORDER_SELECT_FIELDS,
      }),
    )
  }

  deleteById = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.order.delete({
        where: { orderId: id },
        select: ORDER_SELECT_FIELDS,
      }),
    )
  }

  softDelete = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.order.update({
        where: { orderId: id },
        data: {
          status: 'cancelled',
          deletedAt: new Date(),
        },
        select: ORDER_SELECT_FIELDS,
      }),
    )
  }
  restore = async (id: number) => {
    return this.update(id, { deletedAt: null })
  }
}

export const orderRepository = new OrderRepository()
export default OrderRepository
