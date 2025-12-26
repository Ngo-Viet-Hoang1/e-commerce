import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

export const PAYMENT_SELECT_FIELDS = {
  id: true,
  orderId: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  paymentMethod: true,
  paymentStatus: true,
  amount: true,
  currency: true,
  transactionId: true,
  metaData: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const satisfies Prisma.PaymentSelect

class PaymentRepository {
  findById = async (id: number, includeDeleted = false) => {
    return executePrismaQuery(() =>
      prisma.payment.findUnique({
        where: {
          id,
          ...(includeDeleted ? {} : { deletedAt: null }),
        },
        select: PAYMENT_SELECT_FIELDS,
      }),
    )
  }

  findMany = async (params: {
    where?: Prisma.PaymentWhereInput
    orderBy?: Prisma.PaymentOrderByWithRelationInput
    skip?: number
    take?: number
  }) => {
    return executePrismaQuery(() =>
      prisma.payment.findMany({
        ...params,
        select: PAYMENT_SELECT_FIELDS,
      }),
    )
  }

  count = async (where?: Prisma.PaymentWhereInput) => {
    return executePrismaQuery(() => prisma.payment.count({ where }))
  }

  create = async (data: Prisma.PaymentCreateInput) => {
    return executePrismaQuery(() =>
      prisma.payment.create({
        data,
        select: PAYMENT_SELECT_FIELDS,
      }),
    )
  }

  update = async (id: number, data: Prisma.PaymentUpdateInput) => {
    return executePrismaQuery(() =>
      prisma.payment.update({
        where: { id },
        data,
        select: PAYMENT_SELECT_FIELDS,
      }),
    )
  }

  delete = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.payment.delete({
        where: { id },
        select: PAYMENT_SELECT_FIELDS,
      }),
    )
  }

  softDelete = async (id: number) => {
    return this.update(id, { deletedAt: new Date() })
  }

  restore = async (id: number) => {
    return this.update(id, { deletedAt: null })
  }

  exists = async (id: number) => {
    const count = await this.count({ id })
    return count > 0
  }
}

export const paymentRepository = new PaymentRepository()
export default PaymentRepository
