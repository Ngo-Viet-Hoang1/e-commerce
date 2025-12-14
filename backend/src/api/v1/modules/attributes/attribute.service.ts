import type { Prisma } from '@generated/prisma/client'
import { NotFoundException } from '../../shared/models/app-error.model'
import { attributeRepository } from './attribute.repository'
import {
  type CreateAttributeBody,
  type UpdateAttributeBody,
  type ListAttributesQuery,
} from './attribute.schema'

class AttributeService {
  findAll = async (query: ListAttributesQuery) => {
    const { page, limit, sort, search, isFilterable, isSearchable, inputType } =
      query

    const where: Prisma.AttributeWhereInput = {
      ...(isFilterable !== undefined && { isFilterable }),
      ...(isSearchable !== undefined && { isSearchable }),
      ...(inputType && { inputType }),

      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      }),
    }

    const orderBy: Prisma.AttributeOrderByWithRelationInput = {
      [sort]: 'asc',
    }

    const [attributes, total] = await Promise.all([
      attributeRepository.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      attributeRepository.count(where),
    ])

    return { attributes, total, page, limit }
  }

  findById = async (id: number) => {
    const attribute = await attributeRepository.findById(id)

    if (!attribute) {
      throw new NotFoundException('Attribute', id.toString())
    }
    return attribute
  }

  create = async (data: CreateAttributeBody) => {
    const attribute = await attributeRepository.create({
      ...data,
    })
    return attribute
  }

  updateById = async (id: number, data: UpdateAttributeBody) => {
    await this.findById(id)

    const updatedAttribute = await attributeRepository.update(id, {
      ...data,
    })
    return updatedAttribute
  }

  deleteById = async (id: number) => {
    await this.findById(id)

    const deletedAttribute = await attributeRepository.deleteById(id)

    return deletedAttribute
  }

  softDeleteById = async (id: number) => {
    await this.findById(id)

    const deletedAttribute = await attributeRepository.softDelete(id)
    return deletedAttribute
  }

  restoreById = async (id: number) => {
    await this.findById(id)

    const restoredAttribute = await attributeRepository.restore(id)
    return restoredAttribute
  }
}

export const attributeService = new AttributeService()
