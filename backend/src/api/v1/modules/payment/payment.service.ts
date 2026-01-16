import type { Prisma } from '@generated/prisma/client'
import { randomUUID } from 'crypto'
import { NotFoundException } from '../../shared/models/app-error.model'
import { paymentRepository } from './payment.repository'
import type {
  CreatePaymentBody,
  ListPaymentsQuery,
  UpdatePaymentBody,
} from './payment.schema'

class PaymentService {
  findAll = async (query: ListPaymentsQuery) => {
    const { page, limit, sort, order, search } = query

    const where: Prisma.PaymentWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [{ paymentStatus: { contains: search, mode: 'insensitive' } }],
      }),
    }

    const [payments, total] = await Promise.all([
      paymentRepository.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      paymentRepository.count(where),
    ])

    return { payments, total, page, limit }
  }

  async findById(id: number, includeDeleted = false) {
    const payment = await paymentRepository.findById(id, includeDeleted)

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`)
    }

    return payment
  }

  create = async (data: CreatePaymentBody) => {
    const payment = await paymentRepository.create({
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      amount: data.amount,
      currency: data.currency,
      transactionId: randomUUID(),
      metaData: data.metaData!,
      order: { connect: { orderId: data.orderId } },
      user: { connect: { id: data.userId } },
    })

    return payment
  }

  updateById = async (id: number, data: UpdatePaymentBody) => {
    await this.findById(id)

    const updateData: Prisma.PaymentUpdateInput = {
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      amount: data.amount,
      currency: data.currency,
      metaData: data.metaData!,
      order: { connect: { orderId: data.orderId } },
      user: { connect: { id: data.userId } },
    }

    const payment = await paymentRepository.update(id, updateData)

    return payment
  }

  deleteById = async (id: number) => {
    await this.findById(id)

    const deletePayment = await paymentRepository.delete(id)

    return deletePayment
  }

  softDeleteById = async (id: number) => {
    await this.findById(id)

    const softDeletedPayment = await paymentRepository.softDelete(id)

    return softDeletedPayment
  }

  restoreById = async (id: number) => {
    const payment = await this.findById(id, true)

    if (!payment) throw new NotFoundException(`Payment with ID ${id} not found`)

    if (!payment.deletedAt) {
      throw new NotFoundException(`Payment with ID ${id} is not deleted`)
    }

    const restoredPayment = await paymentRepository.restore(id)

    return restoredPayment
  }

  exists = async (id: number): Promise<boolean> => {
    return paymentRepository.exists(id)
  }
}

export const paymentService = new PaymentService()
export default paymentService
