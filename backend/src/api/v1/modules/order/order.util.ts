import type { Prisma } from '@generated/prisma/client'
import type { PrismaTransaction } from '@v1/shared/interfaces/prisma.interface'
import { BadRequestException } from '../../shared/models/app-error.model'
import {
  orderStateMachine,
  paymentStateMachine,
  type StockInstruction,
  type TransitionContext,
} from './finite-state-machine'
import type { OrderStatus, PaymentStatus } from './order.constants'
import { ORDER_SELECT_FIELDS } from './order.repository'
import type { UpdateOrderBody } from './order.schema'

export const parseOrderMetadata = <T extends Record<string, unknown>>(
  metadata: Prisma.JsonValue | null,
): Partial<T> => {
  if (
    metadata !== null &&
    typeof metadata === 'object' &&
    !Array.isArray(metadata)
  ) {
    return metadata as Partial<T>
  }
  return {}
}

export const getOrderPaymentMethod = (order: {
  metadata: Prisma.JsonValue | null
}): string | undefined => {
  const metadata =
    order.metadata &&
    typeof order.metadata === 'object' &&
    !Array.isArray(order.metadata)
      ? (order.metadata as Record<string, unknown>)
      : null

  const paymentMethod = metadata?.paymentMethod
  return typeof paymentMethod === 'string' ? paymentMethod : undefined
}

export const buildDecrementInstructions = (order: {
  orderItems: Array<{ variantId: number | null; quantity: number }>
}): StockInstruction[] => {
  return order.orderItems
    .filter((item) => item.variantId !== null)
    .map((item) => ({
      operation: 'decrement' as const,
      variantId: item.variantId!,
      quantity: item.quantity,
    }))
}

export const incrementStock = async (
  tx: PrismaTransaction,
  variantId: number,
  quantity: number,
) => {
  return await tx.productVariant.update({
    where: { id: variantId },
    data: { stockQuantity: { increment: quantity } },
  })
}

export const decrementStockOptimistic = async (
  tx: PrismaTransaction,
  variantId: number,
  quantity: number,
) => {
  const updated = await tx.productVariant.updateMany({
    where: { id: variantId, deletedAt: null, stockQuantity: { gte: quantity } },
    data: { stockQuantity: { decrement: quantity } },
  })

  if (updated.count === 0) {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      select: { title: true, sku: true, stockQuantity: true, deletedAt: true },
    })

    if (!variant || variant.deletedAt) {
      throw new BadRequestException(
        `Variant ${variantId} is no longer available`,
      )
    }

    throw new BadRequestException(
      `Insufficient stock (race condition): ${variant.title ?? variant.sku}. ` +
        `Available: ${variant.stockQuantity}, Requested: ${quantity}`,
    )
  }
}

export const applyStockInstructions = async (
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

export const executeOrderTransition = async (
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

  await applyStockInstructions(instructions.stockInstructions, tx)

  let paymentStatusUpdate: PaymentStatus | undefined
  if (instructions.cascadePaymentTransition) {
    const paymentInstructions = paymentStateMachine.transition(
      instructions.cascadePaymentTransition,
      { ...ctx, triggeredBy: 'system' },
    )

    await applyStockInstructions(paymentInstructions.stockInstructions, tx)

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
