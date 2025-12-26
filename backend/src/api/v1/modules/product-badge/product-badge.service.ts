import type { Prisma } from '@generated/prisma/client'
import {
  ConflictException,
  NotFoundException,
} from '../../shared/models/app-error.model'
import { productBadgeRepository } from './product-badge.repository'
import type {
  ListProductBadgesQuery,
  ProductBadgeCreate,
} from './product-badge.schema'

class ProductBadgeService {
  findAll = async (query: ListProductBadgesQuery) => {
    const { page, limit, sort, order, search } = query

    const where: Prisma.ProductBadgeWhereInput = {
      ...(search && {
        OR: [
          {
            awardedUser: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            awardedUser: {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ],
      }),
    }

    const [productBadges, total] = await Promise.all([
      productBadgeRepository.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          badge: true,
          awardedUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      productBadgeRepository.count(where),
    ])

    return { productBadges, total, page, limit }
  }

  async findById(productId: number, badgeId: number) {
    const productBadge = await productBadgeRepository.findById(
      productId,
      badgeId,
    )

    if (!productBadge) {
      throw new NotFoundException(
        `ProductBadge (${productId}, ${badgeId}) not found`,
      )
    }

    return productBadge
  }

  create = async (data: ProductBadgeCreate) => {
    const createData: Prisma.ProductBadgeCreateInput = {
      product: { connect: { id: data.productId! } },
      badge: { connect: { id: data.badgeId! } },
      awardedUser: data.awardedBy
        ? { connect: { id: data.awardedBy } }
        : undefined,
    }

    const productBadge = await productBadgeRepository.create(createData)

    return productBadge
  }

  delete = async (productId: number, badgeId: number) => {
    await this.findById(productId, badgeId)

    return productBadgeRepository.delete(productId, badgeId)
  }

  softDelete = async (productId: number, badgeId: number) => {
    await this.findById(productId, badgeId)

    return productBadgeRepository.softDelete(productId, badgeId, new Date())
  }

  restore = async (productId: number, badgeId: number) => {
    const productBadge = await this.findById(productId, badgeId)

    if (!productBadge.deleteAt) {
      throw new ConflictException('Product badge is not deleted')
    }

    return productBadgeRepository.restore(productId, badgeId)
  }
}

export const productBadgeService = new ProductBadgeService()
export default ProductBadgeService
