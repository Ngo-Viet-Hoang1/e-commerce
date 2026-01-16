import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

export const PRODUCT_IMAGE_SELECT_FIELDS = {
  imageId: true,
  product: {
    select: {
      id: true,
    },
  },
  variant: {
    select: {
      id: true,
    },
  },
  url: true,
  altText: true,
  isPrimary: true,
  sortOrder: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const satisfies Prisma.ProductImageSelect

class ProductImageRepository {
  findById = async (imageId: number) => {
    return executePrismaQuery(() =>
      prisma.productImage.findUnique({
        where: {
          imageId,
        },
        select: PRODUCT_IMAGE_SELECT_FIELDS,
      }),
    )
  }

  findMany = async (params: {
    where?: Prisma.ProductImageWhereInput
    orderBy?: Prisma.ProductImageOrderByWithRelationInput
    skip?: number
    take?: number
  }) => {
    return executePrismaQuery(() =>
      prisma.productImage.findMany({
        ...params,
        select: PRODUCT_IMAGE_SELECT_FIELDS,
      }),
    )
  }

  count = async (where?: Prisma.ProductImageWhereInput) => {
    return executePrismaQuery(() => prisma.productImage.count({ where }))
  }

  create = async (data: Prisma.ProductImageCreateInput) => {
    return executePrismaQuery(() =>
      prisma.productImage.create({
        data,
        select: PRODUCT_IMAGE_SELECT_FIELDS,
      }),
    )
  }

  update = async (imageId: number, data: Prisma.ProductImageUpdateInput) => {
    return executePrismaQuery(() =>
      prisma.productImage.update({
        where: { imageId },
        data,
        select: PRODUCT_IMAGE_SELECT_FIELDS,
      }),
    )
  }

  delete = async (imageId: number) => {
    return executePrismaQuery(() =>
      prisma.productImage.delete({
        where: { imageId },
        select: PRODUCT_IMAGE_SELECT_FIELDS,
      }),
    )
  }

  softDelete = async (id: number) => {
    return this.update(id, { deletedAt: new Date() })
  }

  restore = async (id: number) => {
    return this.update(id, { deletedAt: null })
  }
}

export const productImageRepository = new ProductImageRepository()
export default ProductImageRepository
