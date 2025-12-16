import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

export const WARRANTYPOLICIES_SELECT_FIELDS = {
  id: true,
  title: true,
  description: true,
  durationDays: true,
  termsUrl: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const satisfies Prisma.WarrantyPolicySelect

class WarrantyPoliciesRepository {
  findById = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.warrantyPolicy.findUniqueOrThrow({
        where: { id },
        select: WARRANTYPOLICIES_SELECT_FIELDS,
      }),
    )
  }

  findMany = async (params: {
    where?: Prisma.WarrantyPolicyWhereInput
    orderBy?: Prisma.WarrantyPolicyOrderByWithRelationInput
    skip?: number
    take?: number
  }) => {
    return executePrismaQuery(() =>
      prisma.warrantyPolicy.findMany({
        ...params,
        select: WARRANTYPOLICIES_SELECT_FIELDS,
      }),
    )
  }

  count = async (where?: Prisma.WarrantyPolicyWhereInput) => {
    return executePrismaQuery(() => prisma.warrantyPolicy.count({ where }))
  }

  create = async (data: Prisma.WarrantyPolicyCreateInput) => {
    return executePrismaQuery(() =>
      prisma.warrantyPolicy.create({
        data,
        select: WARRANTYPOLICIES_SELECT_FIELDS,
      }),
    )
  }

  update = async (id: number, data: Prisma.WarrantyPolicyUpdateInput) => {
    return executePrismaQuery(() =>
      prisma.warrantyPolicy.update({
        where: { id },
        data,
        select: WARRANTYPOLICIES_SELECT_FIELDS,
      }),
    )
  }

  deleteById = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.warrantyPolicy.delete({
        where: { id },
        select: WARRANTYPOLICIES_SELECT_FIELDS,
      }),
    )
  }

  softDelete = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.warrantyPolicy.update({
        where: { id },
        data: { deletedAt: new Date() },
        select: WARRANTYPOLICIES_SELECT_FIELDS,
      }),
    )
  }

  restore = async (id: number) => {
    return this.update(id, { deletedAt: null })
  }
}

export const warrantyPoliciesRepository = new WarrantyPoliciesRepository()
export default warrantyPoliciesRepository
