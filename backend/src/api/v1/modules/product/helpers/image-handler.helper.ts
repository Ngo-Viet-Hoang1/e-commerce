import type { PrismaClient, ProductVariant } from '@generated/prisma/client'
import type { CreateSimpleProductBody } from '../product.schema'

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>
export class ImageHandler {
  static createProductImages = async (
    tx: TransactionClient,
    productId: number,
    images: CreateSimpleProductBody['images'],
  ): Promise<void> => {
    if (!images || images.length === 0) return

    await tx.productImage.createMany({
      data: images.map((img, index) => ({
        productId,
        variantId: null,
        url: img.url,
        altText: img.altText,
        isPrimary: img.isPrimary,
        sortOrder: index,
      })),
    })
  }

  static createVariantImages = async (
    tx: TransactionClient,
    productId: number,
    variantId: number,
    images: NonNullable<CreateSimpleProductBody['variants'][0]['images']>,
  ): Promise<void> => {
    if (images.length === 0) return

    await tx.productImage.createMany({
      data: images.map((img, index) => ({
        productId,
        variantId,
        url: img.url,
        altText: img.altText,
        isPrimary: img.isPrimary,
        sortOrder: index,
      })),
    })
  }

  static createAllVariantImages = async (
    tx: TransactionClient,
    productId: number,
    variants: CreateSimpleProductBody['variants'],
    createdVariants: ProductVariant[],
  ): Promise<void> => {
    await Promise.all(
      variants.map(async (variant, variantIndex) => {
        if (variant.images && variant.images.length > 0) {
          const createdVariant = createdVariants[variantIndex]
          if (createdVariant) {
            await this.createVariantImages(
              tx,
              productId,
              createdVariant.id,
              variant.images,
            )
          }
        }
      }),
    )
  }

  static createAllImages = async (
    tx: TransactionClient,
    productId: number,
    data: CreateSimpleProductBody,
    createdVariants: ProductVariant[],
  ): Promise<void> => {
    await this.createProductImages(tx, productId, data.images)

    await this.createAllVariantImages(
      tx,
      productId,
      data.variants,
      createdVariants,
    )
  }
}

export default ImageHandler
