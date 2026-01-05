import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

class CartRepository {
  getProductVariant = async (productId: number, variantId: number) => {
    return executePrismaQuery(() =>
      prisma.productVariant.findFirst({
        where: {
          id: variantId,
          productId,
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          sku: true,
          price: true,
          stockQuantity: true,
          isDefault: true,
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              status: true,
              deletedAt: true,
              productImages: {
                take: 1,
                orderBy: { sortOrder: 'asc' },
                select: {
                  url: true,
                },
              },
            },
          },
        },
      }),
    )
  }

  getVariantsByIds = async (variantIds: number[]) => {
    return executePrismaQuery(() =>
      prisma.productVariant.findMany({
        where: {
          id: { in: variantIds },
          deletedAt: null,
        },
        select: {
          id: true,
          productId: true,
          title: true,
          sku: true,
          price: true,
          stockQuantity: true,
          isDefault: true,
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              status: true,
              deletedAt: true,
              productImages: {
                take: 1,
                orderBy: { sortOrder: 'asc' },
                select: {
                  url: true,
                },
              },
            },
          },
        },
      }),
    )
  }
}

export const cartRepository = new CartRepository()
export default CartRepository
