import type { Prisma } from '@generated/prisma/client'
import type { OrderStatus, PaymentStatus } from '../order.constants'

export interface OrderForStateMachine {
  orderId: number
  status: string
  paymentStatus: string | null
  createdAt: Date
  deliveredAt: Date | null
  metadata: Prisma.JsonValue | null
  orderItems: Array<{
    variantId: number | null
    quantity: number
  }>
}

export interface TransitionContext {
  order: OrderForStateMachine
  triggeredBy?: 'user' | 'admin' | 'system' | 'webhook'
  reason?: string
}

export interface StockInstruction {
  variantId: number
  quantity: number
  operation: 'increment' | 'decrement'
}

export interface OrderTransitionResult {
  newStatus: OrderStatus

  orderUpdate: {
    deliveredAt?: Date
    paymentStatus?: PaymentStatus
  }

  stockInstructions: StockInstruction[]

  cascadePaymentTransition?: PaymentStatus

  effects: string[]
}

export interface PaymentTransitionResult {
  newStatus: PaymentStatus
  stockInstructions: StockInstruction[]
  effects: string[]
}

export type OrderTransition = {
  to: OrderStatus
  allowedFor: Array<'user' | 'admin' | 'system' | 'webhook'>
  condition?: (ctx: TransitionContext) => boolean | string
  onEnter: (ctx: TransitionContext) => OrderTransitionResult
}

export type PaymentTransition = {
  to: PaymentStatus
  allowedFor: Array<'user' | 'admin' | 'system' | 'webhook'>
  onEnter: (ctx: TransitionContext) => PaymentTransitionResult
}
