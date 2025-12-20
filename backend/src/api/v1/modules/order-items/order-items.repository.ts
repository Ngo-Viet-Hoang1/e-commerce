import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

export const ORDER_ITEM_SELECT_FIELDS = {
  id: true,
  orderId: true,
  productId: true,
  variantId: true,
  quantity: true,
  unitPrice: true,
  totalPrice: true,
  discount: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const satisfies Prisma.OrderItemSelect

class OrderItemRepository {
  findById = async (id: number, includeDeleted = false) => {
    return executePrismaQuery(() =>
      prisma.orderItem.findFirst({
        where: {
          id,
          ...(includeDeleted ? {} : { deletedAt: null }),
        },
        select: ORDER_ITEM_SELECT_FIELDS,
      }),
    )
  }

  findByIdWithOrderStatus = (id: number) => {
    return prisma.orderItem.findUnique({
      where: { id },
      include: {
        order: {
          select: { status: true },
        },
      },
    })
  }

  findMany = async (param: {
    where?: Prisma.OrderItemWhereInput
    orderBy?: Prisma.OrderItemOrderByWithRelationInput
    skip?: number
    take?: number
  }) => {
    return executePrismaQuery(() =>
      prisma.orderItem.findMany({
        ...param,
        select: ORDER_ITEM_SELECT_FIELDS,
      }),
    )
  }

  count = async (where?: Prisma.OrderItemWhereInput) => {
    return executePrismaQuery(() => prisma.orderItem.count({ where }))
  }

  create = async (data: Prisma.OrderItemCreateInput) => {
    return executePrismaQuery(() =>
      prisma.orderItem.create({
        data,
        select: ORDER_ITEM_SELECT_FIELDS,
      }),
    )
  }

  update = async (id: number, data: Prisma.OrderItemUpdateInput) => {
    return executePrismaQuery(() =>
      prisma.orderItem.update({
        where: { id },
        data,
        select: ORDER_ITEM_SELECT_FIELDS,
      }),
    )
  }

  delete = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.orderItem.delete({
        where: { id },
        select: ORDER_ITEM_SELECT_FIELDS,
      }),
    )
  }

  softDelete = async (id: number) => {
    return this.update(id, { deletedAt: new Date() })
  }

  restore = async (id: number) => {
    return this.update(id, { deletedAt: null })
  }
}

export const orderItemRepository = new OrderItemRepository()
export default OrderItemRepository
