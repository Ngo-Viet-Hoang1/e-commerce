import type { Prisma } from '@generated/prisma/client'
import { NotFoundException } from '../../shared/models/app-error.model'
import { brandRepository } from './brand.repository'
import {
  type BrandCreate,
  type BrandListQuery,
  type BrandUpdate,
} from './brand.schema'

class BrandService {
  findAll = async (query: BrandListQuery) => {
    const { page, limit, sort, order, search } = query
    const where: Prisma.BrandWhereInput = {
      ...(search && {
        OR: [{ name: { contains: search, mode: 'insensitive' } }],
      }),
    }

    const [brands, total] = await Promise.all([
      brandRepository.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      brandRepository.count(where),
    ])

    return { brands, total, page, limit }
  }

  async findById(id: number) {
    const brand = await brandRepository.findById(id)
    if (!brand) {
      throw new NotFoundException('Brand', id.toString())
    }

    return brand
  }

  create = async (data: BrandCreate) => {
    const brand = await brandRepository.create(data)

    return brand
  }

  updateById = async (id: number, data: BrandUpdate) => {
    const brand = await this.findById(id)
    const updateBrand = await brandRepository.update(brand.id, data)

    return updateBrand
  }

  deleteById = async (id: number) => {
    await this.findById(id)
    const deletedBrand = await brandRepository.delete(id)

    return deletedBrand
  }

  softDeleteById = async (id: number) => {
    await this.findById(id)
    const softDeletedBrand = await brandRepository.softDelete(id)

    return softDeletedBrand
  }

  restoreById = async (id: number) => {
    await this.findById(id)
    const restoredBrand = await brandRepository.restore(id)

    return restoredBrand
  }
}

export const brandService = new BrandService()
