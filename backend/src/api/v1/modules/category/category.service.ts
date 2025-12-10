import type { Prisma } from '@generated/prisma/client'
import {
  ConflictException,
  NotFoundException,
} from '../../shared/models/app-error.model'
import categoryRepository from './category.repository'
import type {
  CreateCategoryBody,
  ListCategoriesQuery,
  UpdateCategoryBody,
} from './category.schema'

class CategoryService {
  findAll = async (query: ListCategoriesQuery) => {
    const { page, limit, sort, order, search } = query

    const where: Prisma.CategoryWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [categories, total] = await Promise.all([
      categoryRepository.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      categoryRepository.count(where),
    ])

    return { categories, total, page, limit }
  }

  async findById(id: number, includeDeleted = false) {
    const category = await categoryRepository.findById(id, includeDeleted)

    if (!category) {
      throw new Error(`Category with ID ${id} not found`)
    }

    return category
  }

  async findBySlug(slug: string) {
    const category = await categoryRepository.findBySlug(slug)

    if (!category) {
      throw new Error(`Category with slug ${slug} not found`)
    }

    return category
  }

  create = async (data: CreateCategoryBody) => {
    const category = await categoryRepository.create({
      name: data.name!,
      slug: data.slug!,
      description: data.description || null,
      ...(data.parentId
        ? {
            parent: {
              connect: { id: data.parentId },
            },
          }
        : {}),
    })
    return category
  }

  updateById = async (id: number, data: UpdateCategoryBody) => {
    await this.findById(id)

    const category = await categoryRepository.update(id, data)
    return category
  }

  deleteById = async (id: number) => {
    await this.findById(id)

    const deletedCategory = await categoryRepository.softDelete(id)
    return deletedCategory
  }

  softDeleteById = async (id: number) => {
    await this.findById(id, true)

    const deletedCategory = await categoryRepository.softDelete(id)
    return deletedCategory
  }

  restoreById = async (id: number) => {
    const category = await categoryRepository.findById(id, true)

    if (!category) throw new NotFoundException('Category', id.toString())

    if (!category.deletedAt)
      throw new ConflictException('Category is not deleted')

    const restoredCategory = await categoryRepository.restore(id)
    return restoredCategory
  }

  exists = async (id: number): Promise<boolean> => {
    return categoryRepository.exists(id)
  }

  findByName = async (name: string) => {
    const category = await categoryRepository.findByName(name)

    if (!category) throw new NotFoundException('Category with this name')
    return category
  }
}

export const categoryService = new CategoryService()
export default categoryService
