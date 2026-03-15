import type { Prisma } from '@generated/prisma/client'
import { prisma } from '@v1/shared/config/database/postgres'
import type { PrismaTransaction } from '@v1/shared/interfaces/prisma.interface'
import {
  BadRequestException,
  NotFoundException,
} from '@v1/shared/models/app-error.model'
import { invoiceService } from '../invoice/invoice.service'
import { productVariantService } from '../product-variant'
import type {
  StockInstruction,
  TransitionContext,
} from './finite-state-machine'
import { orderStateMachine, paymentStateMachine } from './finite-state-machine'
import { OrderStatus, PaymentMethod, PaymentStatus } from './order.constants'
import { ORDER_SELECT_FIELDS, orderRepository } from './order.repository'
import type {
  CreateOrderBody,
  UpdateOrderBody,
  listOrdersQuerySchema,
} from './order.schema'
import { PaymentStrategyFactory } from './payment/payment.factory'
import type { PaymentRequestMeta } from './payment/payment.strategy.interface'
import { decrementStockOptimistic, incrementStock } from './order.util'

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
  ) => {
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

    return { ...order, ...paymentResult }
  }

  updateById = async (id: number, data: UpdateOrderBody) => {
    const order = await this.findById(id)

    if (!data.status || data.status === order.status) {
      return orderRepository.update(id, data)
    }

    return prisma.$transaction(async (tx) => {
      return this.executeTransition(
        data.status as OrderStatus,
        { order, triggeredBy: 'admin' },
        tx,
        data,
      )
    })
  }

  cancelUserOrder = async (userId: number, orderId: number) => {
    const order = await this.findUserOrderById(userId, orderId)

    return prisma.$transaction(async (tx) => {
      return this.executeTransition(
        OrderStatus.CANCELLED,
        { order, triggeredBy: 'user' },
        tx,
      )
    })
  }

  returnUserOrder = async (userId: number, orderId: number) => {
    const order = await this.findUserOrderById(userId, orderId)

    return prisma.$transaction(async (tx) => {
      return this.executeTransition(
        OrderStatus.RETURNED,
        { order, triggeredBy: 'user' },
        tx,
      )
    })
  }

  confirmPayment = async (orderId: number) => {
    const order = await this.findById(orderId)

    return prisma.$transaction(async (tx) => {
      const { newStatus, stockInstructions } = paymentStateMachine.transition(
        PaymentStatus.PAID,
        { order, triggeredBy: 'webhook' },
      )

      await this.applyStockInstructions(stockInstructions, tx)

      return tx.order.update({
        where: { orderId: order.orderId },
        data: { paymentStatus: newStatus },
        select: ORDER_SELECT_FIELDS,
      })
    })
  }

  private executeTransition = async (
    toStatus: OrderStatus,
    ctx: TransitionContext,
    tx: PrismaTransaction,
    extraData?: Partial<UpdateOrderBody>,
  ) => {
    const instructions = orderStateMachine.transition(toStatus, ctx)
    const {
      paymentStatus: _ignorePaymentStatus,
      status: _ignoreStatus,
      ...safeExtraData
    } = extraData ?? {}

    await this.applyStockInstructions(instructions.stockInstructions, tx)

    let paymentStatusUpdate: PaymentStatus | undefined
    if (instructions.cascadePaymentTransition) {
      const paymentInstructions = paymentStateMachine.transition(
        instructions.cascadePaymentTransition,
        { ...ctx, triggeredBy: 'system' },
      )

      await this.applyStockInstructions(
        paymentInstructions.stockInstructions,
        tx,
      )

      paymentStatusUpdate = paymentInstructions.newStatus
    }

    return tx.order.update({
      where: { orderId: ctx.order.orderId },
      data: {
        ...safeExtraData,
        status: instructions.newStatus,
        ...instructions.orderUpdate,
        ...(paymentStatusUpdate && { paymentStatus: paymentStatusUpdate }),
      },
      select: ORDER_SELECT_FIELDS,
    })
  }

  private applyStockInstructions = async (
    instructions: StockInstruction[],
    tx: PrismaTransaction,
  ) => {
    for (const { operation, variantId, quantity } of instructions) {
      switch (operation) {
        case 'decrement':
          await decrementStockOptimistic(tx, variantId, quantity)
          break

        case 'increment':
          await incrementStock(tx, variantId, quantity)
          break

        default:
          throw new BadRequestException(`Unknown stock operation: ${operation}`)
      }
    }
  }

  deleteById = async (id: number) => {
    await this.findById(id)
    return orderRepository.deleteById(id)
  }

  softDeleteById = async (id: number) => {
    const order = await this.findById(id)

    return prisma.$transaction(async (tx) => {
      await this.executeTransition(
        OrderStatus.CANCELLED,
        { order, triggeredBy: 'admin' },
        tx,
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
}

export const orderService = new OrderService()
export default OrderService
