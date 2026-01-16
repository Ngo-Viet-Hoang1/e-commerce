import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

export const PRODUCT_VIDEO_SELECT_FIELDS = {
  videoId: true,
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
  title: true,
  provider: true,
  url: true,
  thumbnailUrl: true,
  durationSeconds: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const satisfies Prisma.ProductVideoSelect

class ProductVideoRepository {
  findById = async (videoId: number) => {
    return executePrismaQuery(() =>
      prisma.productVideo.findUnique({
        where: {
          videoId,
        },
        select: PRODUCT_VIDEO_SELECT_FIELDS,
      }),
    )
  }

  findMany = async (params: {
    where?: Prisma.ProductVideoWhereInput
    orderBy?: Prisma.ProductVideoOrderByWithRelationInput
    skip?: number
    take?: number
  }) => {
    return executePrismaQuery(() =>
      prisma.productVideo.findMany({
        ...params,
        select: PRODUCT_VIDEO_SELECT_FIELDS,
      }),
    )
  }

  count = async (where?: Prisma.ProductVideoWhereInput) => {
    return executePrismaQuery(() => prisma.productVideo.count({ where }))
  }

  create = async (data: Prisma.ProductVideoCreateInput) => {
    return executePrismaQuery(() =>
      prisma.productVideo.create({
        data,
        select: PRODUCT_VIDEO_SELECT_FIELDS,
      }),
    )
  }

  update = async (videoId: number, data: Prisma.ProductVideoUpdateInput) => {
    return executePrismaQuery(() =>
      prisma.productVideo.update({
        where: { videoId },
        data,
        select: PRODUCT_VIDEO_SELECT_FIELDS,
      }),
    )
  }

  delete = async (videoId: number) => {
    return executePrismaQuery(() =>
      prisma.productVideo.delete({
        where: { videoId },
        select: PRODUCT_VIDEO_SELECT_FIELDS,
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

export const productVideoRepository = new ProductVideoRepository()
export default ProductVideoRepository
