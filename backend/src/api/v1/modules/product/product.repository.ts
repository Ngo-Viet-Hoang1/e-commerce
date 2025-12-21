import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

export const PRODUCT_SELECT_FIELDS = {
  id: true,
  name: true,
  sku: true,
  shortDescription: true,
  description: true,
  status: true,
  brand: {
    select: {
      id: true,
      name: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  isFeatured: true,
  metaData: true,
  weightGrams: true,
  dimensions: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  variants: {
    select: {
      id: true,
      sku: true,
      title: true,
      barcode: true,
      price: true,
      costPrice: true,
      msrp: true,
      stockQuantity: true,
      backorderable: true,
      isDefault: true,
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
              inputType: true,
            },
          },
        },
      },
      productImages: {
        select: {
          imageId: true,
          url: true,
          altText: true,
          isPrimary: true,
          sortOrder: true,
        },
        where: {
          deletedAt: null,
        },
        orderBy: {
          sortOrder: 'asc' as const,
        },
      },
    },
    where: {
      deletedAt: null,
    },
    orderBy: {
      isDefault: 'desc' as const,
    },
  },
  // Include product-level images
  productImages: {
    select: {
      imageId: true,
      url: true,
      altText: true,
      isPrimary: true,
      sortOrder: true,
    },
    where: {
      deletedAt: null,
    },
    orderBy: {
      sortOrder: 'asc' as const,
    },
  },
} as const satisfies Prisma.ProductSelect

class ProductRepository {
  findById = async (id: number, includeDeleted = false) => {
    return executePrismaQuery(() =>
      prisma.product.findUnique({
        where: {
          id,
          ...(includeDeleted ? {} : { deletedAt: null }),
        },
        select: PRODUCT_SELECT_FIELDS,
      }),
    )
  }

  findBySku = async (sku: string) => {
    return executePrismaQuery(() =>
      prisma.product.findUnique({
        where: { sku },
        select: PRODUCT_SELECT_FIELDS,
      }),
    )
  }

  findByName = async (name: string) => {
    return executePrismaQuery(() =>
      prisma.product.findUnique({
        where: { name },
        select: PRODUCT_SELECT_FIELDS,
      }),
    )
  }

  findMany = async (params: {
    where?: Prisma.ProductWhereInput
    orderBy?: Prisma.ProductOrderByWithRelationInput
    skip?: number
    take?: number
  }) => {
    return executePrismaQuery(() =>
      prisma.product.findMany({
        ...params,
        select: PRODUCT_SELECT_FIELDS,
      }),
    )
  }

  count = async (where?: Prisma.ProductWhereInput) => {
    return executePrismaQuery(() => prisma.product.count({ where }))
  }

  create = async (data: Prisma.ProductCreateInput) => {
    return executePrismaQuery(() =>
      prisma.product.create({
        data,
        select: PRODUCT_SELECT_FIELDS,
      }),
    )
  }

  update = async (id: number, data: Prisma.ProductUpdateInput) => {
    return executePrismaQuery(() =>
      prisma.product.update({
        where: { id },
        data,
        select: PRODUCT_SELECT_FIELDS,
      }),
    )
  }

  delete = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.product.delete({
        where: { id },
        select: PRODUCT_SELECT_FIELDS,
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
}

export const productRepository = new ProductRepository()
export default productRepository
