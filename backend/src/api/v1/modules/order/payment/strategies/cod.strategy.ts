import type { PrismaTransaction } from '@/api/v1/shared/interfaces/prisma.interface'
import { BadRequestException } from '@v1/shared/models/app-error.model'
import type {
  OrderWithItems,
  PaymentResult,
  PaymentStrategy,
} from '../payment.strategy.interface'

export class CodStrategy implements PaymentStrategy {
  async process(_order: OrderWithItems): Promise<PaymentResult> {
    return { paymentStatus: 'pending' }
  }

  async onOrderCreated(
    order: OrderWithItems,
    tx: PrismaTransaction,
  ): Promise<void> {
    for (const item of order.orderItems) {
      if (!item.variantId)
        throw new BadRequestException('Order item missing variantId')

      const updated = await tx.productVariant.updateMany({
        where: {
          id: item.variantId,
          deletedAt: null,
          stockQuantity: { gte: item.quantity },
        },
        data: { stockQuantity: { decrement: item.quantity } },
      })

      if (updated.count === 0) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: {
            stockQuantity: true,
            deletedAt: true,
            title: true,
            sku: true,
          },
        })

        if (!variant || variant.deletedAt) {
          throw new BadRequestException(
            `Product variant ${item.variantId} is no longer available`,
          )
        }

        throw new BadRequestException(
          `Insufficient stock (race condition): ` +
            `${variant.title ?? variant.sku}. ` +
            `Available: ${variant.stockQuantity}, Requested: ${item.quantity}`,
        )
      }
    }
  }
}
