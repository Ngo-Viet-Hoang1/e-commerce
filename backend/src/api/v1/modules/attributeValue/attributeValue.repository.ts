import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

export const ATTRIBUTEVALUES_SELECT_FIELDS = {
  id: true,
  attributeId: true,
  valueText: true,
  valueMeta: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const

class AttributeValueRepository {
  findAll = async (params?: Prisma.AttributeValueFindManyArgs) => {
    return executePrismaQuery(() =>
      prisma.attributeValue.findMany({
        where: {
          deletedAt: null,
          ...(params?.where || {}),
        },
        skip: params?.skip,
        take: params?.take,
        orderBy: params?.orderBy,
        select: ATTRIBUTEVALUES_SELECT_FIELDS,
      }),
    )
  }
  count = async (where?: Prisma.AttributeValueWhereInput) => {
    return executePrismaQuery(() =>
      prisma.attributeValue.count({
        where: {
          deletedAt: null,
          ...(where || {}),
        },
      }),
    )
  }

  findById = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.attributeValue.findUniqueOrThrow({
        where: { id },
        select: ATTRIBUTEVALUES_SELECT_FIELDS,
      }),
    )
  }

  create = async (data: Prisma.AttributeValueCreateInput) => {
    return executePrismaQuery(() =>
      prisma.attributeValue.create({
        data,
        select: ATTRIBUTEVALUES_SELECT_FIELDS,
      }),
    )
  }

  update = async (id: number, data: Prisma.AttributeValueUpdateInput) => {
    return executePrismaQuery(() =>
      prisma.attributeValue.update({
        where: { id },
        data,
        select: ATTRIBUTEVALUES_SELECT_FIELDS,
      }),
    )
  }

  deleteById = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.attributeValue.delete({
        where: { id },
        select: ATTRIBUTEVALUES_SELECT_FIELDS,
      }),
    )
  }

  softDelete = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.attributeValue.update({
        where: { id },
        data: { deletedAt: new Date() },
        select: ATTRIBUTEVALUES_SELECT_FIELDS,
      }),
    )
  }

  restore = async (id: number) => {
    return this.update(id, { deletedAt: null })
  }
}

export const attributeValueRepository = new AttributeValueRepository()
