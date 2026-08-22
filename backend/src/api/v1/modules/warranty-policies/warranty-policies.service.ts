import type { Prisma } from '@generated/prisma/client'
import { NotFoundException } from '../../shared/models/app-error.model'
import warrantyPoliciesRepository from './warranty-policies.repository'
import type {
  CreateWarrantyPolicyBody,
  ListWarrantyPoliciesQuery,
  UpdateWarrantyPolicyBody,
} from './warranty-policies.schema'

class WarrantyPoliciesService {
  findAll = async (query: ListWarrantyPoliciesQuery) => {
    const { page, limit, search, sort, order } = query

    const where: Prisma.WarrantyPolicyWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      deletedAt: null,
    }

    const [warrantyPolicies, total] = await Promise.all([
      warrantyPoliciesRepository.findMany({
        where,
        orderBy: sort ? { [sort]: order } : { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      warrantyPoliciesRepository.count(where),
    ])

    return { warrantyPolicies, total, page, limit }
  }

  findById = async (id: number) => {
    const warrantyPolicy = await warrantyPoliciesRepository.findById(id)
    if (!warrantyPolicy || warrantyPolicy.deletedAt) {
      throw new NotFoundException(`Warranty policy with ID ${id} not found`)
    }
    return warrantyPolicy
  }

  create = async (data: CreateWarrantyPolicyBody) => {
    const warrantyPolicy = await warrantyPoliciesRepository.create({
      product: { connect: { id: data.productId } },
      brand: { connect: { id: data.brandId } },
      title: data.title,
      description: data.description,
      durationDays: data.durationDays,
      termsUrl: data.termsUrl,
    })
    return warrantyPolicy
  }

  update = async (id: number, data: UpdateWarrantyPolicyBody) => {
    await this.findById(id)

    const updateData: Prisma.WarrantyPolicyUpdateInput = {
      ...(data.productId && { product: { connect: { id: data.productId } } }),
      ...(data.brandId && { brand: { connect: { id: data.brandId } } }),
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.durationDays !== undefined && { durationDays: data.durationDays }),
      ...(data.termsUrl !== undefined && { termsUrl: data.termsUrl }),
    }

    const updatedWarrantyPolicy = await warrantyPoliciesRepository.update(
      id,
      updateData,
    )

    return updatedWarrantyPolicy
  }

  deleteById = async (id: number) => {
    await this.findById(id)
    const deleted = await warrantyPoliciesRepository.deleteById(id)
    return deleted
  }

  softDelete = async (id: number) => {
    await this.findById(id)
    const softDeleted = await warrantyPoliciesRepository.softDelete(id)
    return softDeleted
  }

  restore = async (id: number) => {
    const restoredWarrantyPolicy = await warrantyPoliciesRepository.restore(id)
    return restoredWarrantyPolicy
  }
}

export const warrantyPoliciesService = new WarrantyPoliciesService()
export default warrantyPoliciesService
