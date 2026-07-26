import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

export const PRODUCT_SPECIFICATION_SELECT_FIELDS = {
  id: true,
  productId: true,
  key: true,
  value: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  product: {
    select: {
      id: true,
      name: true,
      sku: true,
    },
  },
} as const satisfies Prisma.ProductSpecificationSelect

class ProductSpecificationRepository {
  findById = async (id: number, includeDeleted = false) => {
    return executePrismaQuery(() =>
      prisma.productSpecification.findUnique({
        where: {
          id,
          ...(includeDeleted ? {} : { deletedAt: null }),
        },
        select: PRODUCT_SPECIFICATION_SELECT_FIELDS,
      }),
    )
  }

  findMany = async (params: {
    where?: Prisma.ProductSpecificationWhereInput
    orderBy?: Prisma.ProductSpecificationOrderByWithRelationInput
    skip?: number
    take?: number
  }) => {
    return executePrismaQuery(() =>
      prisma.productSpecification.findMany({
        ...params,
        select: PRODUCT_SPECIFICATION_SELECT_FIELDS,
      }),
    )
  }

  count = async (where?: Prisma.ProductSpecificationWhereInput) => {
    return executePrismaQuery(() =>
      prisma.productSpecification.count({ where }),
    )
  }

  create = async (
    data: Prisma.ProductSpecificationCreateInput,
    tx?: Prisma.TransactionClient,
  ) => {
    const client = tx ?? prisma
    return executePrismaQuery(() =>
      client.productSpecification.create({
        data,
        select: PRODUCT_SPECIFICATION_SELECT_FIELDS,
      }),
    )
  }

  update = async (id: number, data: Prisma.ProductSpecificationUpdateInput) => {
    return executePrismaQuery(() =>
      prisma.productSpecification.update({
        where: { id },
        data,
        select: PRODUCT_SPECIFICATION_SELECT_FIELDS,
      }),
    )
  }

  delete = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.productSpecification.delete({
        where: { id },
        select: PRODUCT_SPECIFICATION_SELECT_FIELDS,
      }),
    )
  }

  softDelete = async (id: number) => {
    return this.update(id, { deletedAt: new Date() })
  }

  restore = async (id: number) => {
    return this.update(id, { deletedAt: null })
  }

  exists = async (id: number) => {
    const count = await this.count({ id })
    return count > 0
  }

  findManyByProductId = async (productId: number) => {
    return executePrismaQuery(() =>
      prisma.productSpecification.findMany({
        where: { productId, deletedAt: null },
        select: PRODUCT_SPECIFICATION_SELECT_FIELDS,
        orderBy: { displayOrder: 'asc' },
      }),
    )
  }
}

export const productSpecificationRepository =
  new ProductSpecificationRepository()
export default productSpecificationRepository
