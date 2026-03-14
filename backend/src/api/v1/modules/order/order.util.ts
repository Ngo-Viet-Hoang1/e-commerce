import type { Prisma } from '@generated/prisma/client'
import type { PrismaTransaction } from '@v1/shared/interfaces/prisma.interface'
import { BadRequestException } from '../../shared/models/app-error.model'

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
