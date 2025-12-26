import type { Prisma } from '@generated/prisma/client'
import { NotFoundException } from '../../shared/models/app-error.model'
import { productRepository } from '../product/product.repository'
import warrantyPoliciesRepository from './warranty-policies.repository'
import type {
  CreateWarrantyPolicyBody,
  ListWarrantyPoliciesQuery,
  UpdateWarrantyPolicyBody,
} from './warranty-policiesshema'

class WarrantyPoliciesService {
  findAll = async (query: ListWarrantyPoliciesQuery) => {
    const { page, limit, sort, order, search } = query

    const where: Prisma.WarrantyPolicyWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [warrantyPolicies, total] = await Promise.all([
      warrantyPoliciesRepository.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      warrantyPoliciesRepository.count(where),
    ])

    return { warrantyPolicies, total, page, limit }
  }

  async findById(id: number, _includeDeleted = false) {
    const warrantyPolicy = await warrantyPoliciesRepository.findById(id)

    if (!warrantyPolicy) {
      throw new NotFoundException('Warranty Policy', id.toString())
    }

    return warrantyPolicy
  }

  create = async (productId: number, data: CreateWarrantyPolicyBody) => {
    const product = await productRepository.findById(productId)

    if (!product) {
      throw new NotFoundException('Product', productId.toString())
    }

    const warrantyPolicy = await warrantyPoliciesRepository.create({
      product: { connect: { id: product.id } },
      brand: { connect: { id: product.brand.id } },
      title: data.title,
      description: data.description,
      durationDays: data.durationDays,
      termsUrl: data.termsUrl,
    })

    return warrantyPolicy
  }

  updateById = async (id: number, data: UpdateWarrantyPolicyBody) => {
    await this.findById(id)

    const updatedWarrantyPolicy = await warrantyPoliciesRepository.update(id, {
      title: data.title,
      description: data.description,
      durationDays: data.durationDays,
      termsUrl: data.termsUrl,
    })
    return updatedWarrantyPolicy
  }

  deleteById = async (id: number) => {
    await this.findById(id)

    const deletedWarrantyPolicy =
      await warrantyPoliciesRepository.deleteById(id)
    return deletedWarrantyPolicy
  }

  softDeleteById = async (id: number) => {
    await this.findById(id)

    const deletedWarrantyPolicy =
      await warrantyPoliciesRepository.softDelete(id)
    return deletedWarrantyPolicy
  }

  restoreById = async (id: number) => {
    await this.findById(id)

    const restoredWarrantyPolicy = await warrantyPoliciesRepository.restore(id)
    return restoredWarrantyPolicy
  }
}

export const warrantyPoliciesService = new WarrantyPoliciesService()
export default warrantyPoliciesService
