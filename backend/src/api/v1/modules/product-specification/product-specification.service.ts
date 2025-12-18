import type { Prisma, PrismaClient } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import {
  ConflictException,
  NotFoundException,
} from '../../shared/models/app-error.model'
import productSpecificationRepository from './product-specification.repository'
import type {
  CreateMultipleByProductIdBody,
  CreateProductSpecificationBody,
  ListProductSpecificationsQuery,
  UpdateProductSpecificationBody,
} from './product-specification.schema'

class ProductSpecificationService {
  findAll = async (query: ListProductSpecificationsQuery) => {
    const { page, limit, sort, order } = query

    const where: Prisma.ProductSpecificationWhereInput = {
      deletedAt: null,
    }

    const [specifications, total] = await Promise.all([
      productSpecificationRepository.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      productSpecificationRepository.count(where),
    ])

    return { specifications, total, page, limit }
  }

  findById = async (id: number, includeDeleted = false) => {
    const specification = await productSpecificationRepository.findById(
      id,
      includeDeleted,
    )

    if (!specification) {
      throw new NotFoundException(
        `Product specification with ID ${id} not found`,
      )
    }

    return specification
  }

  create = async (data: CreateProductSpecificationBody) => {
    const createData: Prisma.ProductSpecificationCreateInput = {
      product: { connect: { id: data.productId } },
      key: data.key,
      value: data.value ?? '',
      displayOrder: data.displayOrder ?? 0,
    }

    return await productSpecificationRepository.create(createData)
  }

  updateById = async (id: number, data: UpdateProductSpecificationBody) => {
    await this.findById(id)

    const updateData: Prisma.ProductSpecificationUpdateInput = {
      key: data.key,
      value: data.value ?? '',
      displayOrder: data.displayOrder,
    }

    return await productSpecificationRepository.update(id, updateData)
  }

  deleteById = async (id: number) => {
    await this.findById(id)
    return await productSpecificationRepository.delete(id)
  }

  softDeleteById = async (id: number) => {
    await this.findById(id)
    return await productSpecificationRepository.softDelete(id)
  }

  restoreById = async (id: number) => {
    const specification = await this.findById(id, true)

    if (!specification.deletedAt) {
      throw new ConflictException('Product specification is not deleted')
    }

    return await productSpecificationRepository.restore(id)
  }

  exists = async (id: number): Promise<boolean> => {
    return productSpecificationRepository.exists(id)
  }

  findAllByProductId = async (productId: number) => {
    return await productSpecificationRepository.findMany({
      where: {
        productId,
        deletedAt: null,
      },
      orderBy: { displayOrder: 'asc' },
    })
  }

  createMultipleByProductId = async (
    productId: number,
    items: CreateMultipleByProductIdBody,
  ) => {
    const productExists = await prisma.product.count({
      where: { id: productId },
    })
    if (productExists === 0) {
      throw new NotFoundException(`Product with ID ${productId} not found`)
    }

    const createData: Prisma.ProductSpecificationCreateInput[] = items.map(
      (item, index) => ({
        product: { connect: { id: productId } },
        key: item.key,
        value: item.value ?? '',
        displayOrder: item.displayOrder ?? index,
      }),
    )

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const results = []
      for (const data of createData) {
        const spec = await productSpecificationRepository.create(data, tx)
        results.push(spec)
      }
      return results
    })
  }
}

export const productSpecificationService = new ProductSpecificationService()
export default productSpecificationService
