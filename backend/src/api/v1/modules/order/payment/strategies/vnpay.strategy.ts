import type { PrismaTransaction } from '@/api/v1/shared/interfaces/prisma.interface'
import { PaymentStatus } from '../../order.constants'
import type {
  OrderWithItems,
  PaymentRequestMeta,
  PaymentResult,
  PaymentStrategy,
} from '../payment.strategy.interface'
import { reservationService } from '../../reservation'
import { createVnpayUrl, normalizeIpAddress } from './vnpay/vnpay.helper'

export class VnpayStrategy implements PaymentStrategy {
  async onOrderCreated(
    order: OrderWithItems,
    tx: PrismaTransaction,
  ): Promise<void> {
    await reservationService.createReservationForOrder(order, tx)
  }

  async process(
    order: OrderWithItems,
    requestMeta: PaymentRequestMeta,
  ): Promise<PaymentResult> {
    const redirectUrl = createVnpayUrl({
      orderId: String(order.orderId),
      amount: Number(order.totalAmount),
      orderInfo: `Thanh toan don hang ${order.orderId}`,
      ipAddr: normalizeIpAddress(requestMeta.ipAddress),
      locale: requestMeta.locale === 'vn' ? 'vn' : 'en',
    })

    return { paymentStatus: PaymentStatus.PENDING, redirectUrl }
  }
}
