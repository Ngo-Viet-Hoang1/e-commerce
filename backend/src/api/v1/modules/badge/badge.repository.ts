import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

export const BADGE_SELECT_FIELDS = {
  id: true,
  code: true,
  name: true,
  description: true,
  iconUrl: true,
  criteria: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const satisfies Prisma.BadgeSelect

class BadgeRepository {
  findById = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.badge.findUnique({
        where: {
          id,
        },
        select: BADGE_SELECT_FIELDS,
      }),
    )
  }

  findMany = async (params: {
    where?: Prisma.BadgeWhereInput
    orderBy?: Prisma.BadgeOrderByWithRelationInput
    skip?: number
    take?: number
  }) => {
    return executePrismaQuery(() =>
      prisma.badge.findMany({
        ...params,
        select: BADGE_SELECT_FIELDS,
      }),
    )
  }

  count = async (where?: Prisma.BadgeWhereInput) => {
    return executePrismaQuery(() => prisma.badge.count({ where }))
  }

  create = async (data: Prisma.BadgeCreateInput) => {
    return executePrismaQuery(() =>
      prisma.badge.create({
        data,
        select: BADGE_SELECT_FIELDS,
      }),
    )
  }

  updateById = async (id: number, data: Prisma.BadgeUpdateInput) => {
    return executePrismaQuery(() =>
      prisma.badge.update({
        where: { id },
        data,
        select: BADGE_SELECT_FIELDS,
      }),
    )
  }

  deleteById = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.badge.delete({
        where: { id },
        select: BADGE_SELECT_FIELDS,
      }),
    )
  }

  softDelete = async (id: number) => {
    return this.updateById(id, { deletedAt: new Date() })
  }

  restore = async (id: number) => {
    return this.updateById(id, { deletedAt: null })
  }
}

export const badgeRepository = new BadgeRepository()
