import { Prisma } from '@generated/prisma/client'
import { NotFoundException } from '../../shared/models/app-error.model'
import { productFaqRepository } from './product-faq.repository'
import type {
  CreateProductFaqBody,
  ListProductFaqsQuery,
  UpdateProductFaqBody,
} from './product-faq.schema'

class ProductFaqService {
  findAll = async (query: ListProductFaqsQuery) => {
    const { page, limit, sort, order, search } = query

    const where: Prisma.ProductFaqWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [{ question: { contains: search, mode: 'insensitive' } }],
      }),
    }

    const [productFaqs, total] = await Promise.all([
      productFaqRepository.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      productFaqRepository.count(where),
    ])

    return { productFaqs, total, page, limit }
  }

  async findById(id: number, includeDeleted = false) {
    const productFaq = await productFaqRepository.findById(id, includeDeleted)

    if (!productFaq) {
      throw new NotFoundException(`Product FAQ with ID ${id} not found`)
    }

    return productFaq
  }

  create = async (data: CreateProductFaqBody) => {
    const createData: Prisma.ProductFaqCreateInput = {
      question: data.question!,
      isPublic: data.isPublic,
      status: data.status!,
      product: { connect: { id: data.productId } },
      user: { connect: { id: data.userId } },
      ...(data.answer && { answer: data.answer, answeredAt: new Date() }),
      ...(data.answeredByUserId && {
        answeredByUser: { connect: { id: data.answeredByUserId } },
      }),
    }

    return productFaqRepository.create(createData)
  }

  updateById = async (id: number, data: UpdateProductFaqBody) => {
    await this.findById(id)

    const updateData: Prisma.ProductFaqUpdateInput = {
      question: data.question,
      isPublic: data.isPublic,
      status: data.status,
      product: { connect: { id: data.productId } },
      user: { connect: { id: data.userId } },
      ...(data.answer && { answer: data.answer, answeredAt: new Date() }),
      ...(data.answeredByUserId && {
        answeredByUser: { connect: { id: data.answeredByUserId } },
      }),
    }

    return productFaqRepository.update(id, updateData)
  }

  deleteById = async (id: number) => {
    await this.findById(id)

    const deletedProductFaq = await productFaqRepository.delete(id)

    return deletedProductFaq
  }

  softDeleteById = async (id: number) => {
    await this.findById(id)

    const softDeletedProductFaq = await productFaqRepository.softDelete(id)

    return softDeletedProductFaq
  }

  restoreById = async (id: number) => {
    const productFaq = await this.findById(id, true)

    if (!productFaq) {
      throw new NotFoundException(`Product FAQ with ID ${id} not found`)
    }

    if (!productFaq.deletedAt) {
      throw new NotFoundException(`Product FAQ with ID ${id} is not deleted`)
    }

    const restoredProductFaq = await productFaqRepository.restore(id)

    return restoredProductFaq
  }

  exists = async (id: number) => {
    const count = await productFaqRepository.count({ id })
    return count > 0
  }
}

export const productFaqService = new ProductFaqService()
export default ProductFaqService
