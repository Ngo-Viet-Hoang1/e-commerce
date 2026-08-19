import type { Prisma } from '@generated/prisma/client'
import { prisma } from '@v1/shared/config/database/postgres'
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@v1/shared/models/app-error.model'
import redis from '../../shared/config/database/redis'
import type { PrismaTransaction } from '../../shared/interfaces/prisma.interface'
import { invoiceService } from '../invoice/invoice.service'
import { productVariantService } from '../product-variant'
import {
  isOnlinePaymentMethod,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from './order.constants'
import { paymentStateMachine } from './finite-state-machine'
import { ORDER_SELECT_FIELDS, orderRepository } from './order.repository'
import type {
  CreateOrderBody,
  listOrdersQuerySchema,
  UpdateOrderBody,
} from './order.schema'
import { executeOrderTransition, getOrderPaymentMethod } from './order.util'
import { PaymentStrategyFactory } from './payment/payment.factory'
import type { PaymentRequestMeta } from './payment/payment.strategy.interface'
import { reservationService } from './reservation'

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
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { shippingRecipientName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [orders, total] = await Promise.all([
      orderRepository.findMany({
        where,
        orderBy: { [sort || 'createdAt']: order || 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      orderRepository.count(where),
    ])

    return { orders, total, page, limit }
  }

  findById = async (id: number) => {
    return orderRepository.findById(id)
  }

  create = async (
    data: CreateOrderBody,
    requestMeta: PaymentRequestMeta = {},
    idempotencyKey?: string,
  ) => {
    const redisKey = idempotencyKey
      ? `order:idempotency:${idempotencyKey}`
      : undefined

    if (redisKey) {
      const lock = await redis.set(redisKey, 'processing', 'EX', 120, 'NX')

      if (!lock) {
        const value = await redis.get(redisKey)
        if (value === null) {
          throw new ConflictException('Please try again')
        } else if (value === 'processing') {
          throw new ConflictException('Order is being processed')
        } else {
          return this.findById(Number(value))
        }
      }
    }

    const {
      items,
      shippingAddress,
      billingAddress,
      metadata,
      shippingFee = 0,
      paymentMethod = PaymentMethod.COD,
      shippingProvinceId,
      shippingDistrictId,
      userId,
      ...rest
    } = data

    const strategy = PaymentStrategyFactory.get(paymentMethod)

    try {
      const itemsData = await Promise.all(
        items.map(async (item) => {
          const variant = await productVariantService.findById(item.variantId)

          if (variant.productId !== item.productId) {
            throw new BadRequestException(
              `Variant ${item.variantId} does not belong to product ${item.productId}`,
            )
          }

          if (variant.stockQuantity < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock: ${variant.title ?? variant.sku}. ` +
                `Available: ${variant.stockQuantity}, Requested: ${item.quantity}`,
            )
          }

          const unitPrice = Number(variant.price)
          const discount = item.discount ?? 0

          return {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice,
            totalPrice: unitPrice * item.quantity - discount,
            discount,
          }
        }),
      )

      const totalAmount =
        itemsData.reduce((sum, item) => sum + item.totalPrice, 0) + shippingFee

      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            ...rest,
            userId: userId ?? null,
            shippingProvinceId: shippingProvinceId ?? null,
            shippingDistrictId: shippingDistrictId ?? null,
            shippingAddress: shippingAddress ?? undefined,
            billingAddress: billingAddress ?? undefined,
            totalAmount,
            shippingFee,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            metadata: {
              ...(typeof metadata === 'object' && metadata !== null
                ? metadata
                : {}),
              paymentMethod,
            },
            orderItems: { create: itemsData },
          },
          include: { orderItems: true },
        })

        await strategy.onOrderCreated(newOrder, tx)
        return newOrder
      })

      const paymentResult = await strategy.process(order, requestMeta)
      if (redisKey) {
        await redis.setex(redisKey, 900, order.orderId)
      }

      return { ...order, ...paymentResult }
    } catch (error) {
      if (redisKey) {
        redis.del(redisKey)
      }
      throw error
    }
  }

  updateById = async (id: number, data: UpdateOrderBody) => {
    const order = await this.findById(id)

    if (!data.status || data.status === order.status) {
      return orderRepository.update(id, data)
    }

    return prisma.$transaction(async (tx) => {
      const updatedOrder = await executeOrderTransition(
        data.status as OrderStatus,
        { order, triggeredBy: 'admin' },
        tx,
        data,
      )

      await this.releaseReservationOnPendingOnlineCancel(
        order,
        updatedOrder.status,
        tx,
      )

      return updatedOrder
    })
  }

  cancelUserOrder = async (userId: number, orderId: number) => {
    const order = await this.findUserOrderById(userId, orderId)

    return prisma.$transaction(async (tx) => {
      const cancelledOrder = await executeOrderTransition(
        OrderStatus.CANCELLED,
        { order, triggeredBy: 'user' },
        tx,
      )

      await this.releaseReservationOnPendingOnlineCancel(
        order,
        cancelledOrder.status,
        tx,
        'cancelled_by_user',
      )

      return cancelledOrder
    })
  }

  returnUserOrder = async (userId: number, orderId: number) => {
    const order = await this.findUserOrderById(userId, orderId)

    return prisma.$transaction(async (tx) => {
      return executeOrderTransition(
        OrderStatus.RETURNED,
        { order, triggeredBy: 'user' },
        tx,
      )
    })
  }

  confirmPayment = async (orderId: number) => {
    const order = await this.findById(orderId)

    return prisma.$transaction(async (tx) => {
      const { newStatus } = paymentStateMachine.transition(PaymentStatus.PAID, {
        order,
        triggeredBy: 'webhook',
      })

      const updated = await tx.order.updateMany({
        where: { orderId: order.orderId, paymentStatus: PaymentStatus.PENDING },
        data: { paymentStatus: newStatus },
      })

      if (updated.count === 0) return

      if (isOnlinePaymentMethod(getOrderPaymentMethod(order))) {
        await reservationService.commitByOrderId(orderId, tx)
      }
    })
  }

  markPaymentFailed = async (orderId: number, reason = 'payment_failed') => {
    const order = await this.findById(orderId)

    return prisma.$transaction(async (tx) => {
      const { newStatus } = paymentStateMachine.transition(
        PaymentStatus.FAILED,
        {
          order,
          triggeredBy: 'webhook',
        },
      )

      if (isOnlinePaymentMethod(getOrderPaymentMethod(order))) {
        await reservationService.releaseByOrderId(orderId, tx, reason)
      }

      await tx.order.updateMany({
        where: {
          orderId,
          paymentStatus: PaymentStatus.PENDING,
        },
        data: { paymentStatus: newStatus },
      })
    })
  }

  deleteById = async (id: number) => {
    await this.findById(id)
    return orderRepository.deleteById(id)
  }

  softDeleteById = async (id: number) => {
    const order = await this.findById(id)

    return prisma.$transaction(async (tx) => {
      const softDeletedOrder = await executeOrderTransition(
        OrderStatus.CANCELLED,
        { order, triggeredBy: 'admin' },
        tx,
      )

      await this.releaseReservationOnPendingOnlineCancel(
        order,
        softDeletedOrder.status,
        tx,
        'cancelled_by_admin',
      )

      return tx.order.update({
        where: { orderId: order.orderId },
        data: { deletedAt: new Date() },
        select: ORDER_SELECT_FIELDS,
      })
    })
  }

  restoreById = async (id: number) => {
    await this.findById(id)
    return orderRepository.restore(id)
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
    if (!order) throw new NotFoundException('Order', orderId.toString())
    return order
  }

  generateInvoicePDF = async (orderId: number, userId?: number) => {
    const order = userId
      ? await orderRepository.findByIdForUser(orderId, userId)
      : await orderRepository.findById(orderId)

    if (!order) throw new NotFoundException('Order', orderId.toString())

    return invoiceService.generatePDF(order)
  }

  private releaseReservationOnPendingOnlineCancel = async (
    order: Prisma.OrderGetPayload<{ include: { orderItems: true } }>,
    nextStatus: string,
    tx: PrismaTransaction,
    reason = 'order_cancelled',
  ) => {
    if (nextStatus !== OrderStatus.CANCELLED) return
    if (order.paymentStatus !== PaymentStatus.PENDING) return
    if (!isOnlinePaymentMethod(getOrderPaymentMethod(order))) return

    await reservationService.releaseByOrderId(order.orderId, tx, reason)
  }
}

export const orderService = new OrderService()
export default OrderService
