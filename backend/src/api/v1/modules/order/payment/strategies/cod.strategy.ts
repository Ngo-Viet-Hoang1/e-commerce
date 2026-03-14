import type { PrismaTransaction } from '@/api/v1/shared/interfaces/prisma.interface'
import { BadRequestException } from '@v1/shared/models/app-error.model'
import type {
  OrderWithItems,
  PaymentRequestMeta,
  PaymentResult,
  PaymentStrategy,
} from '../payment.strategy.interface'
import { decrementStockOptimistic } from '../../order.util'
import { PaymentStatus } from '../../order.constants'

export class CodStrategy implements PaymentStrategy {
  async process(
    _order: OrderWithItems,
    _requestMeta: PaymentRequestMeta,
  ): Promise<PaymentResult> {
    return { paymentStatus: PaymentStatus.PAID }
  }

  async onOrderCreated(
    order: OrderWithItems,
    tx: PrismaTransaction,
  ): Promise<void> {
    for (const item of order.orderItems) {
      if (!item.variantId)
        throw new BadRequestException('Order item missing variantId')

      await decrementStockOptimistic(tx, item.variantId, item.quantity)
    }
  }
}
