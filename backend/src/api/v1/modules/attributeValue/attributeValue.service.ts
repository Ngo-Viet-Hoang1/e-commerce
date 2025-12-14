import type { Prisma } from '@generated/prisma/client'
import { NotFoundException } from '../../shared/models/app-error.model'
import { attributeValueRepository } from './attributeValue.repository'
import {
  type ListAttributeValuesQuery,
  type UpdateAttributeValueBody,
  type createAttributeValueBodySchema,
} from './attributeValue.schema'

class AttributeValueService {
  findAll = async (attributeId: number, query: ListAttributeValuesQuery) => {
    const { page, limit, sort, order, search } = query

    const where: Prisma.AttributeValueWhereInput = {
      attributeId,
      deletedAt: null,
      ...(search && {
        valueText: {
          contains: search,
          mode: 'insensitive',
        },
      }),
    }

    const [values, total] = await Promise.all([
      attributeValueRepository.findAll({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      attributeValueRepository.count(where),
    ])

    return { values, total, page, limit }
  }

  findById = async (id: number) => {
    const attributeValue = await attributeValueRepository.findById(id)

    if (!attributeValue) {
      throw new NotFoundException('Attribute Value', id.toString())
    }
    return attributeValue
  }
  create = async (data: createAttributeValueBodySchema) => {
    const attributeValue = await attributeValueRepository.create({
      ...data,
    })
    return attributeValue
  }

  updateById = async (id: number, data: UpdateAttributeValueBody) => {
    await this.findById(id)

    const updateAttributeValue = await attributeValueRepository.update(id, data)
    return updateAttributeValue
  }

  deleteById = async (id: number) => {
    await this.findById(id)

    const deletedAttributeValue = await attributeValueRepository.deleteById(id)

    return deletedAttributeValue
  }

  softDeleteById = async (id: number) => {
    await this.findById(id)

    const deletedAttributeValue = await attributeValueRepository.softDelete(id)
    return deletedAttributeValue
  }

  restoreById = async (id: number) => {
    await this.findById(id)

    const retoredAttributeValue = await attributeValueRepository.restore(id)
    return retoredAttributeValue
  }
}

export const attributeValueService = new AttributeValueService()
