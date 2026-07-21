import type { PrismaClient, ProductVariant } from '@generated/prisma/client'
import type { CreateSimpleProductBody } from '../product.schema'

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>

export class VariantBuilder {
  static resolveVariantAttributeIds = (
    variant: CreateSimpleProductBody['variants'][0],
    attributeValueMap: Map<string, number>,
  ): number[] => {
    const attributeValueIds: number[] = []

    if (variant.attributes && variant.attributes.length > 0) {
      for (const attr of variant.attributes) {
        const key = `${attr.attributeName.trim().toLowerCase()}|${attr.value.trim().toLowerCase()}`
        const valueId = attributeValueMap.get(key)
        if (valueId) {
          attributeValueIds.push(valueId)
        }
      }
    }

    return attributeValueIds
  }

  static createVariant = async (
    tx: TransactionClient,
    productId: number,
    variant: CreateSimpleProductBody['variants'][0],
    attributeValueIds: number[],
  ): Promise<ProductVariant> => {
    return tx.productVariant.create({
      data: {
        productId,
        sku: variant.sku,
        title: variant.title,
        price: variant.price,
        costPrice: variant.costPrice,
        stockQuantity: variant.stockQuantity,
        isDefault: variant.isDefault,
        attributeValues:
          attributeValueIds.length > 0
            ? {
                connect: attributeValueIds.map((id) => ({ id })),
              }
            : undefined,
      },
    })
  }

  static createVariants = async (
    tx: TransactionClient,
    productId: number,
    variants: CreateSimpleProductBody['variants'],
    attributeValueMap: Map<string, number>,
  ): Promise<ProductVariant[]> => {
    const createdVariants = await Promise.all(
      variants.map(async (variant) => {
        const attributeValueIds = this.resolveVariantAttributeIds(
          variant,
          attributeValueMap,
        )

        return this.createVariant(tx, productId, variant, attributeValueIds)
      }),
    )

    return createdVariants
  }
}

export default VariantBuilder
