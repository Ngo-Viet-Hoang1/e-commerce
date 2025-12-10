import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

export const CATEGORY_SELECT_FIELDS = {
  id: true,
  parentId: true,
  name: true,
  description: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const satisfies Prisma.CategorySelect

class CategoryRepository {
  findById = async (id: number, includeDeleted = false) => {
    return executePrismaQuery(() =>
      prisma.category.findUnique({
        where: {
          id,
          ...(includeDeleted ? {} : { deletedAt: null }),
        },
        select: CATEGORY_SELECT_FIELDS,
      }),
    )
  }

  findByName = async (name: string) => {
    return executePrismaQuery(() =>
      prisma.category.findUnique({
        where: { name },
        select: CATEGORY_SELECT_FIELDS,
      }),
    )
  }

  findMany = async (params: {
    where?: Prisma.CategoryWhereInput
    orderBy?: Prisma.CategoryOrderByWithRelationInput
    skip?: number
    take?: number
  }) => {
    return executePrismaQuery(() =>
      prisma.category.findMany({
        ...params,
        select: CATEGORY_SELECT_FIELDS,
      }),
    )
  }

  findBySlug = async (slug: string) => {
    return executePrismaQuery(() =>
      prisma.category.findUnique({
        where: { slug },
        select: CATEGORY_SELECT_FIELDS,
      }),
    )
  }

  count = async (where?: Prisma.CategoryWhereInput) => {
    return executePrismaQuery(() => prisma.category.count({ where }))
  }

  create = async (data: Prisma.CategoryCreateInput) => {
    return executePrismaQuery(() =>
      prisma.category.create({
        data,
        select: CATEGORY_SELECT_FIELDS,
      }),
    )
  }

  update = async (id: number, data: Prisma.CategoryUpdateInput) => {
    return executePrismaQuery(() =>
      prisma.category.update({
        where: { id },
        data,
        select: CATEGORY_SELECT_FIELDS,
      }),
    )
  }

  delete = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.category.delete({
        where: { id },
        select: CATEGORY_SELECT_FIELDS,
      }),
    )
  }

  softDelete = async (id: number) => {
    return this.update(id, { deletedAt: new Date() })
  }

  restore = async (id: number) => {
    return this.update(id, { deletedAt: null })
  }

  exists = async (id: number): Promise<boolean> => {
    const count = await this.count({ id })
    return count > 0
  }
}

export const categoryRepository = new CategoryRepository()
export default categoryRepository
