import type { PrismaTransaction } from '@/api/v1/shared/interfaces/prisma.interface'
import type { Prisma } from '@generated/prisma/client'
import type { PaymentStatus } from '../order.constants'

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: { orderItems: true }
}>

export interface PaymentRequestMeta {
  ipAddress?: string
  returnUrl?: string
  locale?: string
}

export interface PaymentResult {
  paymentStatus: PaymentStatus
  redirectUrl?: string
}

export interface PaymentStrategy {
  process(
    order: OrderWithItems,
    requestMeta: PaymentRequestMeta,
  ): Promise<PaymentResult>

  onOrderCreated(order: OrderWithItems, tx: PrismaTransaction): Promise<void>
}
