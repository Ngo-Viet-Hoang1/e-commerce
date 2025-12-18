import { Prisma } from '@generated/prisma/client'
import { NotFoundException } from '../../shared/models/app-error.model'
import { productImageRepository } from './product-image.repository'
import type {
  CreateProductImageBody,
  ListProductImagesQuery,
} from './product-image.schema'

class ProductImageService {
  findAll = async (query: ListProductImagesQuery) => {
    const { page, limit, sort, order, search } = query

    const where: Prisma.ProductImageWhereInput = {
      ...(search && {
        OR: [
          {
            altText: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            product: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            variant: {
              sku: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ],
      }),
    }

    const [images, total] = await Promise.all([
      productImageRepository.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      productImageRepository.count(where),
    ])

    return { images, total, page, limit }
  }

  findById = async (imageId: number) => {
    const image = await productImageRepository.findById(imageId)

    if (!image) {
      throw new NotFoundException(`Product image with ID ${imageId} not found`)
    }

    return image
  }

  create = async (data: CreateProductImageBody) => {
    const createData: Prisma.ProductImageCreateInput = {
      url: data.url!,
      altText: data.altText,
      isPrimary: data.isPrimary ?? false,
      sortOrder: data.sortOrder ?? 0,
      metadata: data.metadata,
      ...(data.productId && {
        product: { connect: { id: data.productId } },
      }),
      ...(data.variantId && {
        variant: { connect: { id: data.variantId } },
      }),
    }

    return productImageRepository.create(createData)
  }

  deleteById = async (imageId: number) => {
    await this.findById(imageId)

    return productImageRepository.delete(imageId)
  }

  softDeleteById = async (imageId: number) => {
    await this.findById(imageId)

    return productImageRepository.update(imageId, {
      deletedAt: new Date(),
    })
  }

  restoreById = async (imageId: number) => {
    await this.findById(imageId)

    return productImageRepository.restore(imageId)
  }
}

export const productImageService = new ProductImageService()
export default ProductImageService
