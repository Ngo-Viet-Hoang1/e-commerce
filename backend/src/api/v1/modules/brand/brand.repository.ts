import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

export const BRAND_SELECT_FIELDS = {
  id: true,
  name: true,
  description: true,
  logoUrl: true,
  website: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const satisfies Prisma.BrandSelect

class BrandRepository {
  findById = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.brand.findUnique({
        where: {
          id,
        },
        select: BRAND_SELECT_FIELDS,
      }),
    )
  }

  findByName = async (name: string) => {
    return executePrismaQuery(() =>
      prisma.brand.findFirst({
        where: { name },
        select: BRAND_SELECT_FIELDS,
      }),
    )
  }

  findMany = async (params: {
    where?: Prisma.BrandWhereInput
    orderBy?: Prisma.BrandOrderByWithRelationInput
    skip?: number
    take?: number
  }) => {
    return executePrismaQuery(() =>
      prisma.brand.findMany({
        ...params,
        select: BRAND_SELECT_FIELDS,
      }),
    )
  }

  count = async (where?: Prisma.BrandWhereInput) => {
    return executePrismaQuery(() => prisma.brand.count({ where }))
  }

  create = async (data: Prisma.BrandCreateInput) => {
    return executePrismaQuery(() =>
      prisma.brand.create({
        data,
        select: BRAND_SELECT_FIELDS,
      }),
    )
  }

  update = async (id: number, data: Prisma.BrandUpdateInput) => {
    return executePrismaQuery(() =>
      prisma.brand.update({
        where: { id },
        data,
        select: BRAND_SELECT_FIELDS,
      }),
    )
  }

  delete = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.brand.delete({
        where: { id },
        select: BRAND_SELECT_FIELDS,
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

export const brandRepository = new BrandRepository()
