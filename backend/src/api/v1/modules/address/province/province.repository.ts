import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../../shared/config/database/postgres'
import { executePrismaQuery } from '../../../shared/utils/prisma-error.util'

export const PROVINCE_SELECT_FIELDS = {
  id: true,
  code: true,
  name: true,
  nameEn: true,
  createdAt: true,
  updatedAt: true,
  wards: {
    select: {
      id: true,
      code: true,
      name: true,
      nameEn: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      name: 'asc' as const,
    },
  },
} as const satisfies Prisma.ProvinceSelect

class ProvinceRepository {
  findById = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.province.findUnique({
        where: { id },
        select: PROVINCE_SELECT_FIELDS,
      }),
    )
  }

  findByCode = async (code: string) => {
    return executePrismaQuery(() =>
      prisma.province.findUnique({
        where: { code },
        select: PROVINCE_SELECT_FIELDS,
      }),
    )
  }

  findByName = async (name: string) => {
    return executePrismaQuery(() =>
      prisma.province.findUnique({
        where: { name },
        select: PROVINCE_SELECT_FIELDS,
      }),
    )
  }

  findMany = async (params: {
    where?: Prisma.ProvinceWhereInput
    orderBy?: Prisma.ProvinceOrderByWithRelationInput
    skip?: number
    take?: number
  }) => {
    return executePrismaQuery(() =>
      prisma.province.findMany({
        ...params,
        select: PROVINCE_SELECT_FIELDS,
      }),
    )
  }

  count = async (where?: Prisma.ProvinceWhereInput) => {
    return executePrismaQuery(() => prisma.province.count({ where }))
  }

  existsById = async (id: number) => {
    const count = await this.count({ id })
    return count > 0
  }

  existsByCode = async (code: string) => {
    const count = await this.count({ code })
    return count > 0
  }

  getAll = async () => {
    return this.findMany({
      orderBy: { name: 'asc' },
    })
  }
}

export const provinceRepository = new ProvinceRepository()
export default provinceRepository