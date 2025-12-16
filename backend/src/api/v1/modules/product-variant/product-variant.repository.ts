import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

export const PRODUCT_VARIANT_SELECT_FIELDS = {
  id: true,
  productId: true,
  sku: true,
  title: true,
  barcode: true,
  price: true,
  costPrice: true,
  msrp: true,
  stockQuantity: true,
  backorderable: true,
  isDefault: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,

  attributeValues: {
    select: {
      id: true,
      valueText: true,
      attribute: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} as const satisfies Prisma.ProductVariantSelect

class ProductVariantRepository {
  findById = async (id: number, includeDeleted = false) => {
    return executePrismaQuery(() =>
      prisma.productVariant.findFirst({
        where: {
          id,
          ...(includeDeleted ? {} : { deletedAt: null }),
        },
        select: PRODUCT_VARIANT_SELECT_FIELDS,
      }),
    )
  }

  findMany = async (params: {
    where?: Prisma.ProductVariantWhereInput
    orderBy?: Prisma.ProductVariantOrderByWithRelationInput
    skip?: number
    take?: number
  }) => {
    return executePrismaQuery(() =>
      prisma.productVariant.findMany({
        ...params,
        select: PRODUCT_VARIANT_SELECT_FIELDS,
      }),
    )
  }

  count = async (where?: Prisma.ProductVariantWhereInput) => {
    return executePrismaQuery(() => prisma.productVariant.count({ where }))
  }

  create = async (data: Prisma.ProductVariantCreateInput) => {
    return executePrismaQuery(() =>
      prisma.productVariant.create({
        data,
        select: PRODUCT_VARIANT_SELECT_FIELDS,
      }),
    )
  }

  update = async (id: number, data: Prisma.ProductVariantUpdateInput) => {
    return executePrismaQuery(() =>
      prisma.productVariant.update({
        where: { id },
        data,
        select: PRODUCT_VARIANT_SELECT_FIELDS,
      }),
    )
  }

  delete = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.productVariant.delete({
        where: { id },
        select: PRODUCT_VARIANT_SELECT_FIELDS,
      }),
    )
  }

  softDelete = async (id: number) => {
    return this.update(id, { deletedAt: new Date() })
  }

  restore = async (id: number) => {
    return this.update(id, { deletedAt: null })
  }

  exists = async (id: number, includeDeleted = false) => {
    const count = await this.count({
      id,
      ...(includeDeleted ? {} : { deletedAt: null }),
    })
    return count > 0
  }
}

export const productVariantRepository = new ProductVariantRepository()
export default ProductVariantRepository
