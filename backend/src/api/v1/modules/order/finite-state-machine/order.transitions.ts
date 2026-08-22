import {
  BadRequestException,
  ForbiddenException,
} from '@v1/shared/models/app-error.model'
import { OrderStatus, PaymentMethod, PaymentStatus } from '../order.constants'
import { parseOrderMetadata } from '../order.util'
import type {
  OrderForStateMachine,
  OrderTransition,
  OrderTransitionResult,
  StockInstruction,
  TransitionContext,
} from './state-machine.types'

export function buildRestoreInstructions(
  order: OrderForStateMachine,
): StockInstruction[] {
  return order.orderItems
    .filter((item) => item.variantId !== null)
    .map((item) => ({
      variantId: item.variantId!,
      quantity: item.quantity,
      operation: 'increment',
    }))
}

const ORDER_TRANSITIONS: Record<OrderStatus, OrderTransition[]> = {
  [OrderStatus.PENDING]: [
    {
      to: OrderStatus.PROCESSING,
      allowedFor: ['admin', 'system'],
      onEnter: () => ({
        newStatus: OrderStatus.PROCESSING,
        orderUpdate: {},
        stockInstructions: [],
        effects: ['send_processing_email'],
      }),
    },
    {
      to: OrderStatus.SHIPPED,
      allowedFor: ['admin', 'system'],
      onEnter: () => ({
        newStatus: OrderStatus.SHIPPED,
        orderUpdate: {},
        stockInstructions: [],
        effects: ['send_shipping_email'],
      }),
    },
    {
      to: OrderStatus.DELIVERED,
      allowedFor: ['admin', 'system'],
      onEnter: ({ order }): OrderTransitionResult => {
        const meta = parseOrderMetadata(order.metadata)
        const isCOD =
          !meta.paymentMethod ||
          String(meta.paymentMethod).toLowerCase() === PaymentMethod.COD

        const orderUpdate = {
          deliveredAt: new Date(),
          ...(isCOD && { paymentStatus: PaymentStatus.PAID }),
        }

        return {
          newStatus: OrderStatus.DELIVERED,
          orderUpdate,
          stockInstructions: [],
          effects: [
            'set_delivered_at',
            ...(isCOD ? ['auto_confirm_cod_payment'] : []),
            'send_delivery_email',
          ],
        }
      },
    },
    {
      to: OrderStatus.CANCELLED,
      allowedFor: ['user', 'admin', 'system'],
      condition: ({ triggeredBy, order }) => {
        if (triggeredBy !== 'user') return true

        const hoursSinceOrder =
          (Date.now() - order.createdAt.getTime()) / 3_600_000

        if (hoursSinceOrder > 1)
          return 'Cannot cancel order after 1 hour. Please contact support.'

        return true
      },
      onEnter: ({ order }): OrderTransitionResult => {
        const meta = parseOrderMetadata(order.metadata)

        const isCOD = meta.paymentMethod === PaymentMethod.COD
        const isPaid = order.paymentStatus === PaymentStatus.PAID

        const shouldRestoreStock = isCOD || isPaid

        const stockInstructions = shouldRestoreStock
          ? buildRestoreInstructions(order)
          : []

        const effects: string[] = []

        if (stockInstructions.length > 0) {
          effects.push('restore_stock')
        }

        if (isPaid) {
          effects.push('cascade_refund')
        }

        return {
          newStatus: OrderStatus.CANCELLED,
          orderUpdate: {},
          stockInstructions,
          cascadePaymentTransition: isPaid ? PaymentStatus.REFUNDED : undefined,
          effects,
        }
      },
    },
  ],

  [OrderStatus.PROCESSING]: [
    {
      to: OrderStatus.SHIPPED,
      allowedFor: ['admin', 'system'],
      onEnter: () => ({
        newStatus: OrderStatus.SHIPPED,
        orderUpdate: {},
        stockInstructions: [],
        effects: ['send_shipping_email'],
      }),
    },
    {
      to: OrderStatus.DELIVERED,
      allowedFor: ['admin', 'system'],
      onEnter: ({ order }): OrderTransitionResult => {
        const meta = parseOrderMetadata(order.metadata)
        const isCOD =
          !meta.paymentMethod ||
          String(meta.paymentMethod).toLowerCase() === PaymentMethod.COD

        const orderUpdate = {
          deliveredAt: new Date(),
          ...(isCOD && { paymentStatus: PaymentStatus.PAID }),
        }

        return {
          newStatus: OrderStatus.DELIVERED,
          orderUpdate,
          stockInstructions: [],
          effects: [
            'set_delivered_at',
            ...(isCOD ? ['auto_confirm_cod_payment'] : []),
            'send_delivery_email',
          ],
        }
      },
    },
    {
      to: OrderStatus.CANCELLED,
      allowedFor: ['admin'],
      onEnter: ({ order }): OrderTransitionResult => {
        const isPaid = order.paymentStatus === PaymentStatus.PAID
        return {
          newStatus: OrderStatus.CANCELLED,
          orderUpdate: {},
          stockInstructions: buildRestoreInstructions(order),
          cascadePaymentTransition: isPaid ? PaymentStatus.REFUNDED : undefined,
          effects: ['restore_stock', ...(isPaid ? ['cascade_refund'] : [])],
        }
      },
    },
  ],

  [OrderStatus.SHIPPED]: [
    {
      to: OrderStatus.DELIVERED,
      allowedFor: ['admin', 'system'],
      onEnter: ({ order }): OrderTransitionResult => {
        const meta = parseOrderMetadata(order.metadata)
        const isCOD =
          !meta.paymentMethod ||
          String(meta.paymentMethod).toLowerCase() === PaymentMethod.COD

        const orderUpdate = {
          deliveredAt: new Date(),
          ...(isCOD && { paymentStatus: PaymentStatus.PAID }),
        }

        return {
          newStatus: OrderStatus.DELIVERED,
          orderUpdate,
          stockInstructions: [],
          effects: [
            'set_delivered_at',
            ...(isCOD ? ['auto_confirm_cod_payment'] : []),
            'send_delivery_email',
          ],
        }
      },
    },
    {
      to: OrderStatus.CANCELLED,
      allowedFor: ['admin'],
      onEnter: ({ order }): OrderTransitionResult => {
        const isPaid = order.paymentStatus === PaymentStatus.PAID

        return {
          newStatus: OrderStatus.CANCELLED,
          orderUpdate: {},
          stockInstructions: buildRestoreInstructions(order),
          cascadePaymentTransition: isPaid ? PaymentStatus.REFUNDED : undefined,
          effects: ['restore_stock', 'send_cancellation_email'],
        }
      },
    },
    {
      to: OrderStatus.RETURNED,
      // Case đặc biệt: shipper báo hàng bị trả lại trước khi delivered
      // Chỉ admin xử lý được — user không tự return khi chưa nhận hàng
      allowedFor: ['admin'],
      onEnter: ({ order }): OrderTransitionResult => {
        const isPaid = order.paymentStatus === PaymentStatus.PAID
        return {
          newStatus: OrderStatus.RETURNED,
          orderUpdate: {},
          stockInstructions: buildRestoreInstructions(order),
          cascadePaymentTransition: isPaid ? PaymentStatus.REFUNDED : undefined,
          effects: ['restore_stock', 'cascade_refund', 'send_return_email'],
        }
      },
    },
  ],

  [OrderStatus.DELIVERED]: [
    {
      to: OrderStatus.RETURNED,
      allowedFor: ['user', 'admin'],
      condition: ({ order }) => {
        if (!order.deliveredAt) return true
        const daysSinceDelivery =
          (Date.now() - order.deliveredAt.getTime()) / 86_400_000

        if (daysSinceDelivery > 7) return 'Return period (7 days) has expired'

        return true
      },
      onEnter: ({ order }): OrderTransitionResult => {
        const isPaid = order.paymentStatus === PaymentStatus.PAID
        return {
          newStatus: OrderStatus.RETURNED,
          orderUpdate: {},
          stockInstructions: buildRestoreInstructions(order),
          cascadePaymentTransition: isPaid ? PaymentStatus.REFUNDED : undefined,
          effects: ['restore_stock', 'cascade_refund', 'send_return_email'],
        }
      },
    },
  ],

  [OrderStatus.CANCELLED]: [],
  [OrderStatus.RETURNED]: [],
}

export class OrderStateMachine {
  canTransition(
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
    triggeredBy: TransitionContext['triggeredBy'] = 'system',
  ): { allowed: boolean; reason?: string } {
    const transition = this.findTransition(fromStatus, toStatus)

    if (!transition) {
      return {
        allowed: false,
        reason: `Cannot transition from '${fromStatus}' to '${toStatus}'`,
      }
    }

    if (!transition.allowedFor.includes(triggeredBy)) {
      return {
        allowed: false,
        reason: `'${triggeredBy}' is not allowed to perform this transition`,
      }
    }

    return { allowed: true }
  }

  transition(
    toStatus: OrderStatus,
    ctx: TransitionContext,
  ): OrderTransitionResult {
    const { order, triggeredBy = 'system' } = ctx
    const fromStatus = order.status as OrderStatus

    const transition = this.findTransition(fromStatus, toStatus)
    if (!transition) {
      throw new BadRequestException(
        `Invalid status transition: ${fromStatus} → ${toStatus}`,
        { from: fromStatus, to: toStatus },
      )
    }

    if (!transition.allowedFor.includes(triggeredBy)) {
      throw new ForbiddenException(
        `'${triggeredBy}' cannot transition order from '${fromStatus}' to '${toStatus}'`,
      )
    }

    if (transition.condition) {
      const result = transition.condition(ctx)
      if (result !== true) {
        throw new BadRequestException(
          typeof result === 'string' ? result : 'Transition condition not met',
        )
      }
    }

    return transition.onEnter(ctx)
  }

  getAvailableTransitions(
    fromStatus: OrderStatus,
    triggeredBy: TransitionContext['triggeredBy'] = 'system',
  ): OrderStatus[] {
    return (ORDER_TRANSITIONS[fromStatus] ?? [])
      .filter((t) => t.allowedFor.includes(triggeredBy))
      .map((t) => t.to)
  }

  private findTransition(
    from: OrderStatus,
    to: OrderStatus,
  ): OrderTransition | undefined {
    return (ORDER_TRANSITIONS[from] ?? []).find((t) => t.to === to)
  }
}

export const orderStateMachine = new OrderStateMachine()
