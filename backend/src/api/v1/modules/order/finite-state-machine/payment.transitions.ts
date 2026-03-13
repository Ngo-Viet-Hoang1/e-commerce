import {
  BadRequestException,
  ForbiddenException,
} from '@v1/shared/models/app-error.model'
import { PaymentMethod, PaymentStatus } from '../order.constants'
import { parseOrderMetadata } from '../order.util'
import type {
  PaymentTransition,
  PaymentTransitionResult,
  TransitionContext,
} from './state-machine.types'

const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentTransition[]> = {
  [PaymentStatus.PENDING]: [
    {
      to: PaymentStatus.PAID,
      allowedFor: ['webhook', 'admin'],
      onEnter: ({ order }): PaymentTransitionResult => {
        const meta = parseOrderMetadata(order.metadata)
        const isCOD = meta.paymentMethod === PaymentMethod.COD

        const stockInstructions = isCOD
          ? []
          : order.orderItems
              .filter((item) => item.variantId !== null)
              .map((item) => ({
                variantId: item.variantId!,
                quantity: item.quantity,
                operation: 'decrement' as const,
              }))

        return {
          newStatus: PaymentStatus.PAID,
          stockInstructions,
          effects: [
            ...(stockInstructions.length > 0 ? ['decrement_stock'] : []),
            'send_payment_confirmation',
          ],
        }
      },
    },
    {
      to: PaymentStatus.FAILED,
      allowedFor: ['webhook', 'system'],
      onEnter: (): PaymentTransitionResult => ({
        newStatus: PaymentStatus.FAILED,
        stockInstructions: [],
        effects: ['send_payment_failed_notification'],
      }),
    },
  ],

  [PaymentStatus.PAID]: [
    {
      to: PaymentStatus.REFUNDED,
      allowedFor: ['admin', 'system'],
      onEnter: (): PaymentTransitionResult => ({
        newStatus: PaymentStatus.REFUNDED,
        stockInstructions: [],
        // TODO: call refund API of provider
        effects: ['initiate_refund_to_bank'],
      }),
    },
  ],

  [PaymentStatus.FAILED]: [
    {
      to: PaymentStatus.PENDING,
      allowedFor: ['user', 'system'],
      onEnter: (): PaymentTransitionResult => ({
        newStatus: PaymentStatus.PENDING,
        stockInstructions: [],
        effects: ['reset_for_retry'],
      }),
    },
  ],

  [PaymentStatus.REFUNDED]: [],
}

export class PaymentStateMachine {
  transition(
    toStatus: PaymentStatus,
    ctx: TransitionContext,
  ): PaymentTransitionResult {
    const fromStatus = (ctx.order.paymentStatus ??
      PaymentStatus.PENDING) as PaymentStatus

    const transition = (PAYMENT_TRANSITIONS[fromStatus] ?? []).find(
      (t) => t.to === toStatus,
    )

    if (!transition) {
      throw new BadRequestException(
        `Invalid payment status transition: ${fromStatus} → ${toStatus}`,
        { from: fromStatus, to: toStatus },
      )
    }

    if (!transition.allowedFor.includes(ctx.triggeredBy ?? 'system')) {
      throw new ForbiddenException(
        `Cannot transition payment from '${fromStatus}' to '${toStatus}'`,
      )
    }

    return transition.onEnter(ctx)
  }

  getAvailableTransitions(
    fromStatus: PaymentStatus,
    triggeredBy: TransitionContext['triggeredBy'] = 'system',
  ): PaymentStatus[] {
    return (PAYMENT_TRANSITIONS[fromStatus] ?? [])
      .filter((t) => t.allowedFor.includes(triggeredBy))
      .map((t) => t.to)
  }
}

export const paymentStateMachine = new PaymentStateMachine()
