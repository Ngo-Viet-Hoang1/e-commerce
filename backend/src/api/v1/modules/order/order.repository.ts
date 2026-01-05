import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

const ORDER_ITEM_SELECT_BASIC = {
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
  product: {
    select: {
      id: true,
      name: true,
      sku: true,
    },
  },
  variant: {
    select: {
      id: true,
      title: true,
      sku: true,
      price: true,
    },
  },
} as const

const ORDER_ITEM_SELECT_FULL = {
  ...ORDER_ITEM_SELECT_BASIC,
  product: {
    select: {
      id: true,
      name: true,
      sku: true,
      productImages: {
        select: {
          imageId: true,
          url: true,
          altText: true,
          isPrimary: true,
        },
        take: 1,
        orderBy: { isPrimary: 'desc' as const },
      },
    },
  },
  variant: {
    select: {
      id: true,
      title: true,
      sku: true,
      price: true,
      productImages: {
        select: {
          imageId: true,
          url: true,
          altText: true,
          isPrimary: true,
        },
        take: 1,
        orderBy: { isPrimary: 'desc' as const },
      },
    },
  },
} as const

const ORDER_BASE_FIELDS = {
  orderId: true,
  userId: true,
  status: true,
  totalAmount: true,
  currency: true,
  shippingProvinceId: true,
  shippingDistrictId: true,
  shippingAddressDetail: true,
  shippingRecipientName: true,
  shippingPhone: true,
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
  user: {
    select: {
      id: true,
      email: true,
      name: true,
    },
  },
  province: {
    select: {
      id: true,
      name: true,
    },
  },
  district: {
    select: {
      id: true,
      name: true,
    },
  },
} as const

export const ORDER_SELECT_FIELDS = {
  ...ORDER_BASE_FIELDS,
  orderItems: {
    select: ORDER_ITEM_SELECT_BASIC,
  },
} as const

export const ORDER_SELECT_FIELDS_FULL = {
  ...ORDER_BASE_FIELDS,
  orderItems: {
    select: ORDER_ITEM_SELECT_FULL,
  },
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

  findByIdForUser = async (id: number, userId: number) => {
    return executePrismaQuery(() =>
      prisma.order.findFirst({
        where: { orderId: id, userId, deletedAt: null },
        select: ORDER_SELECT_FIELDS_FULL,
      }),
    )
  }

  findManyForUser = async (
    userId: number,
    options?: {
      skip?: number
      take?: number
      orderBy?: Prisma.OrderOrderByWithRelationInput
    },
  ) => {
    return executePrismaQuery(() =>
      prisma.order.findMany({
        where: { userId, deletedAt: null },
        select: ORDER_SELECT_FIELDS_FULL,
        orderBy: options?.orderBy ?? { createdAt: 'desc' },
        skip: options?.skip,
        take: options?.take,
      }),
    )
  }

  countForUser = async (userId: number) => {
    return executePrismaQuery(() =>
      prisma.order.count({ where: { userId, deletedAt: null } }),
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
