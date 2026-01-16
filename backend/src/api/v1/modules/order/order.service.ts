import type { Prisma } from '@generated/prisma/client'
import { NotFoundException } from '../../shared/models/app-error.model'
import { orderRepository } from './order.repository'
import {
  type CreateOrderBody,
  type UpdateOrderBody,
  type listOrdersQuerySchema,
} from './order.schema'
import { productVariantRepository } from '../product-variant'
import { prisma } from '../../shared/config/database/postgres'
import puppeteer from 'puppeteer'
import { generateInvoiceHTML, type InvoiceData } from './invoice.template'

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
      paymentMethod = 'cod',
      shippingProvinceId,
      shippingDistrictId,
      userId,
      ...rest
    } = data

    const isCOD = paymentMethod === 'cod'

    const itemsData = await Promise.all(
      items.map(async (item) => {
        const variant = await productVariantRepository.findById(item.variantId)

        if (!variant) {
          throw new NotFoundException('Variant', item.variantId.toString())
        }

        if (variant.deletedAt) {
          throw new NotFoundException(
            'Product variant is no longer available',
            item.variantId.toString(),
          )
        }

        if (variant.productId !== item.productId) {
          throw new NotFoundException('Variant does not belong to product')
        }

        if (variant.stockQuantity < item.quantity) {
          throw new NotFoundException(
            `Insufficient stock for variant ${variant.title || variant.sku}. Available: ${variant.stockQuantity}, Requested: ${item.quantity}`,
          )
        }

        const unitPrice = variant.price
        const discount = item.discount || 0
        const totalPrice = unitPrice.toNumber() * item.quantity - discount

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

    const itemsTotal = itemsData.reduce((sum, item) => sum + item.totalPrice, 0)
    const totalAmount = itemsTotal + shippingFee

    const orderStatus = 'pending'
    const orderPaymentStatus = 'pending'

    const orderMetadata = {
      ...(typeof metadata === 'object' ? metadata : {}),
      paymentMethod,
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          ...rest,
          userId,
          totalAmount,
          shippingFee,
          status: orderStatus,
          paymentStatus: orderPaymentStatus,
          shippingProvinceId,
          shippingDistrictId,
          shippingAddress: shippingAddress ?? undefined,
          billingAddress: billingAddress ?? undefined,
          metadata: orderMetadata,
          orderItems: {
            create: itemsData,
          },
        },
        include: {
          orderItems: true,
        },
      })

      if (isCOD) {
        for (const item of itemsData) {
          const updated = await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              stockQuantity: {
                gte: item.quantity,
              },
              deletedAt: null,
            },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          })

          if (updated.count === 0) {
            const currentVariant = await tx.productVariant.findUnique({
              where: { id: item.variantId },
            })

            if (!currentVariant || currentVariant.deletedAt) {
              throw new NotFoundException(
                'Product variant is no longer available',
                item.variantId.toString(),
              )
            }

            throw new NotFoundException(
              `Insufficient stock. Available: ${currentVariant.stockQuantity}, Requested: ${item.quantity}`,
            )
          }
        }
      }

      return newOrder
    })

    // TODO: For online payment, integrate with payment gateway
    // if (!isCOD) {
    //   const paymentUrl = await generatePaymentUrl(order, paymentMethod)
    //   return { ...order, paymentUrl }
    // }

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

    if (!['pending', 'processing', 'shipped'].includes(order.status)) {
      throw new NotFoundException(
        'Cannot cancel order with status: ' + order.status,
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
    // Fetch order with all related data and verify access
    if (userId) {
      await this.findUserOrderById(userId, orderId)
    } else {
      await this.findById(orderId)
    }

    const orderWithDetails = await orderRepository.findById(orderId)

    if (!orderWithDetails) {
      throw new NotFoundException('Order', orderId.toString())
    }

    // Convert Decimal to number for template
    const orderData = {
      ...orderWithDetails,
      totalAmount: Number(orderWithDetails.totalAmount),
      shippingFee: orderWithDetails.shippingFee
        ? Number(orderWithDetails.shippingFee)
        : null,
      orderItems: orderWithDetails.orderItems.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        discount: Number(item.discount),
      })),
    }

    // Generate HTML from template
    const html = generateInvoiceHTML(orderData as InvoiceData)

    // Launch Puppeteer and generate PDF
    // Try to use system Chrome first, fallback to bundled Chromium
    let browser
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      })
    } catch {
      // If Puppeteer Chrome not found, try to use system Chrome
      browser = await puppeteer.launch({
        headless: true,
        executablePath:
          process.platform === 'win32'
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
            : process.platform === 'darwin'
              ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
              : '/usr/bin/google-chrome',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      })
    }

    try {
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      })

      return pdfBuffer
    } finally {
      await browser.close()
    }
  }

  // TODO: Handle payment confirmation webhook (VNPay, PayPal)
  // confirmPayment = async (orderId: number, paymentData: any) => {
  //   const order = await this.findById(orderId)
  //
  //   // Verify payment with gateway
  //   // If valid, update order status and decrement stock
  //
  //   const { prisma } = await import('../../shared/config/database/postgres')
  //
  //   await prisma.$transaction(async (tx) => {
  //     // Update order
  //     await tx.order.update({
  //       where: { orderId },
  //       data: {
  //         status: 'pending',
  //         paymentStatus: 'paid',
  //       },
  //     })
  //
  //     // Decrement stock (same logic as COD)
  //     for (const item of order.orderItems) {
  //       await tx.productVariant.updateMany({
  //         where: {
  //           id: item.variantId,
  //           stockQuantity: { gte: item.quantity },
  //         },
  //         data: {
  //           stockQuantity: { decrement: item.quantity },
  //         },
  //       })
  //     }
  //   })
  // }
}

export const orderService = new OrderService()
export default OrderService
