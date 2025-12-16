import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'
export const PRODUCT_BADGE_SELECT_FIELDS = {
  productId: true,
  badgeId: true,
  awardedAt: true,
  awardedBy: true,
  awardedUser: {
    select: {
      id: true,
      name: true,
    },
  },
  deleteAt: true,
} as const satisfies Prisma.ProductBadgeSelect

class ProductBadgeRepository {
  findMany = async (options: Prisma.ProductBadgeFindManyArgs) => {
    return executePrismaQuery(() =>
      prisma.productBadge.findMany({
        ...options,
      }),
    )
  }

  findById = async (productId: number, badgeId: number) => {
    return executePrismaQuery(() =>
      prisma.productBadge.findUnique({
        where: {
          productId_badgeId: {
            productId,
            badgeId,
          },
        },
      }),
    )
  }

  count = async (where: Prisma.ProductBadgeWhereInput) => {
    return executePrismaQuery(() =>
      prisma.productBadge.count({
        where,
      }),
    )
  }

  create = async (data: Prisma.ProductBadgeCreateInput) => {
    return executePrismaQuery(() =>
      prisma.productBadge.create({
        data,
      }),
    )
  }

  update = async (
    productId: number,
    badgeId: number,
    data: Prisma.ProductBadgeUpdateInput,
  ) => {
    return executePrismaQuery(() =>
      prisma.productBadge.update({
        where: {
          productId_badgeId: {
            productId,
            badgeId,
          },
        },
        data,
      }),
    )
  }

  delete = async (productId: number, badgeId: number) => {
    return executePrismaQuery(() =>
      prisma.productBadge.delete({
        where: {
          productId_badgeId: {
            productId,
            badgeId,
          },
        },
      }),
    )
  }

  softDelete = async (productId: number, badgeId: number, deleteAt: Date) => {
    return this.update(productId, badgeId, { deleteAt })
  }

  restore = async (productId: number, badgeId: number) => {
    return this.update(productId, badgeId, { deleteAt: null })
  }
}

export const productBadgeRepository = new ProductBadgeRepository()
export default ProductBadgeRepository
