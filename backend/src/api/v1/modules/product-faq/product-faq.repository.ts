import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

export const PRODUCT_FAQ_SELECT_FIELDS = {
  id: true,
  product: {
    select: {
      id: true,
      name: true,
      sku: true,
    },
  },
  user: {
    select: {
      id: true,
      name: true,
    },
  },
  question: true,
  answer: true,
  answeredByUser: {
    select: {
      id: true,
      name: true,
    },
  },
  isPublic: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const satisfies Prisma.ProductFaqSelect

class ProductFaqRepository {
  findById = async (id: number, includeDeleted = false) => {
    return executePrismaQuery(() =>
      prisma.productFaq.findUnique({
        where: {
          id,
          ...(includeDeleted ? {} : { deletedAt: null }),
        },
        select: PRODUCT_FAQ_SELECT_FIELDS,
      }),
    )
  }

  findMany = async (params: {
    where?: Prisma.ProductFaqWhereInput
    orderBy?: Prisma.ProductFaqOrderByWithRelationInput
    skip?: number
    take?: number
  }) => {
    return executePrismaQuery(() =>
      prisma.productFaq.findMany({
        ...params,
        select: PRODUCT_FAQ_SELECT_FIELDS,
      }),
    )
  }

  count = async (where?: Prisma.ProductFaqWhereInput) => {
    return executePrismaQuery(() => prisma.productFaq.count({ where }))
  }

  create = async (data: Prisma.ProductFaqCreateInput) => {
    return executePrismaQuery(() =>
      prisma.productFaq.create({
        data,
        select: PRODUCT_FAQ_SELECT_FIELDS,
      }),
    )
  }

  update = async (id: number, data: Prisma.ProductFaqUpdateInput) => {
    return executePrismaQuery(() =>
      prisma.productFaq.update({
        where: { id },
        data,
        select: PRODUCT_FAQ_SELECT_FIELDS,
      }),
    )
  }

  delete = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.productFaq.delete({
        where: { id },
        select: PRODUCT_FAQ_SELECT_FIELDS,
      }),
    )
  }

  softDelete = async (id: number) => {
    return this.update(id, { deletedAt: new Date() })
  }

  restore = async (id: number) => {
    return this.update(id, { deletedAt: null })
  }

  exists = async (where: Prisma.ProductFaqWhereInput) => {
    const count = await this.count(where)
    return count > 0
  }
}

export const productFaqRepository = new ProductFaqRepository()
export default ProductFaqRepository
