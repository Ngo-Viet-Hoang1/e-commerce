import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

export const ATTRIBUTES_SELECT_FIELDS = {
  id: true,
  name: true,
  inputType: true,
  isFilterable: true,
  isSearchable: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const

class AttributeRepository {
  findById = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.attribute.findUniqueOrThrow({
        where: { id },
        select: ATTRIBUTES_SELECT_FIELDS,
      }),
    )
  }

  findMany = async (params: Prisma.AttributeFindManyArgs) => {
    return executePrismaQuery(() =>
      prisma.attribute.findMany({
        ...params,
      }),
    )
  }

  count = async (where: Prisma.AttributeWhereInput) => {
    return executePrismaQuery(() => prisma.attribute.count({ where }))
  }

  create = async (data: Prisma.AttributeCreateInput) => {
    return executePrismaQuery(() =>
      prisma.attribute.create({
        data,
        select: ATTRIBUTES_SELECT_FIELDS,
      }),
    )
  }

  update = async (id: number, data: Prisma.AttributeUpdateInput) => {
    return executePrismaQuery(() =>
      prisma.attribute.update({
        where: { id },
        data,
        select: ATTRIBUTES_SELECT_FIELDS,
      }),
    )
  }

  deleteById = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.attribute.delete({
        where: { id },
        select: ATTRIBUTES_SELECT_FIELDS,
      }),
    )
  }

  softDelete = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.attribute.update({
        where: { id },
        data: { deletedAt: new Date() },
        select: ATTRIBUTES_SELECT_FIELDS,
      }),
    )
  }

  restore = async (id: number) => {
    return this.update(id, { deletedAt: null })
  }
}

export const attributeRepository = new AttributeRepository()
