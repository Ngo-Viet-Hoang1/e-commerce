import type { Prisma } from '@generated/prisma/client'
import { prisma } from '@v1/shared/config/database/postgres'
import {
  BadRequestException,
  NotFoundException,
} from '@v1/shared/models/app-error.model'
import { invoiceService } from '../invoice/invoice.service'
import { productVariantService } from '../product-variant'
import { OrderStatus, PaymentMethod, PaymentStatus } from './order.constants'
import { orderRepository } from './order.repository'
import type {
  CreateOrderBody,
  UpdateOrderBody,
  listOrdersQuerySchema,
} from './order.schema'
import { PaymentStrategyFactory } from './payment/payment.factory'
import type { PaymentRequestMeta } from './payment/payment.strategy.interface'
import { parseOrderMetadata } from './order.util'

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
    const order = await orderRepository.findById(id)

    if (!order) throw new NotFoundException('Order', id.toString())
    return order
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
        const totalPrice = unitPrice * item.quantity - discount

        return {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
          discount,
        }
      }),
    )

    const totalAmount =
      itemsData.reduce((sum, item) => sum + item.totalPrice, 0) + shippingFee

    const order = await prisma.$transaction(async (tx) => {
      const createData: Prisma.OrderUncheckedCreateInput = {
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
      }

      const newOrder = await tx.order.create({
        data: createData,
        include: { orderItems: true },
      })

      await strategy.onOrderCreated(newOrder, tx)
      return newOrder
    })

    const paymentResult = await strategy.process(order, requestMeta)

    return { ...order, ...paymentResult }
  }

  updateById = async (id: number, data: UpdateOrderBody) => {
    await this.findById(id)

    const updateData: Prisma.OrderUpdateInput = { ...data }

    if (data.status === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date()
    }

    return orderRepository.update(id, updateData)
  }

  deleteById = async (id: number) => {
    await this.findById(id)
    return orderRepository.deleteById(id)
  }

  softDeleteById = async (id: number) => {
    await this.findById(id)
    return orderRepository.softDelete(id)
  }

  restoreById = async (id: number) => {
    await this.findById(id)
    return orderRepository.update(id, { deletedAt: null })
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

  cancelUserOrder = async (userId: number, orderId: number) => {
    const order = await this.findUserOrderById(userId, orderId)

    if (
      ![OrderStatus.PENDING, OrderStatus.PROCESSING].includes(
        order.status as
          | typeof OrderStatus.PENDING
          | typeof OrderStatus.PROCESSING,
      )
    ) {
      throw new BadRequestException(
        `Cannot cancel order with status '${order.status}'. ` +
          `Only 'pending' or 'processing' orders can be cancelled.`,
      )
    }

    const cancelledOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { orderId },
        data: {
          status: 'cancelled',
        },
        include: {
          orderItems: true,
        },
      })

      const orderMeta = order.metadata as { paymentMethod?: string } | null
      const wasCOD = orderMeta?.paymentMethod === 'cod'
      const shouldRestoreStock = wasCOD || order.paymentStatus === 'paid'

      if (shouldRestoreStock) {
        for (const item of updated.orderItems) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stockQuantity: {
                  increment: item.quantity,
                },
              },
            })
          }
        }
      }

      return updated
    })

    return cancelledOrder
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
