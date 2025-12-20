import { Prisma } from '@generated/prisma/client'
import { NotFoundException } from '../../shared/models/app-error.model'
import { productVideoRepository } from './product-video.repository'
import type {
  CreateProductVideoBody,
  ListProductVideosQuery,
} from './product-video.schema'

class ProductVideoService {
  findAll = async (query: ListProductVideosQuery) => {
    const { page, limit, sort, order } = query

    const where: Prisma.ProductVideoWhereInput = {}

    const [videos, total] = await Promise.all([
      productVideoRepository.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      productVideoRepository.count(where),
    ])

    return { videos, total, page, limit }
  }

  findById = async (videoId: number) => {
    const video = await productVideoRepository.findById(videoId)

    if (!video) {
      throw new NotFoundException(`Product video with ID ${videoId} not found`)
    }

    return video
  }

  create = async (data: CreateProductVideoBody) => {
    const createData: Prisma.ProductVideoCreateInput = {
      title: data.title,
      provider: data.provider,
      url: data.url!,
      thumbnailUrl: data.thumbnailUrl,
      durationSeconds: data.durationSeconds,
      ...(data.productId && {
        product: { connect: { id: data.productId } },
      }),
      ...(data.variantId && {
        variant: { connect: { id: data.variantId } },
      }),
    }

    return productVideoRepository.create(createData)
  }

  deleteById = async (videoId: number) => {
    await this.findById(videoId)

    return productVideoRepository.delete(videoId)
  }

  softDeleteById = async (videoId: number) => {
    await this.findById(videoId)

    return productVideoRepository.update(videoId, {
      deletedAt: new Date(),
    })
  }

  restoreById = async (videoId: number) => {
    await this.findById(videoId)

    return productVideoRepository.restore(videoId)
  }
}

export const productVideoService = new ProductVideoService()
export default ProductVideoService
