import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

export const PROVINCE_SELECT_FIELDS = {
  id: true,
  code: true,
  name: true,
  nameEn: true,
  fullName: true,
  fullNameEn: true,
  codeName: true,
  administrativeUnitId: true,
  administrativeUnitShortName: true,
  administrativeUnitFullName: true,
  administrativeUnitFullNameEn: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.ProvinceSelect

class ProvinceRepository {
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

  findByCode = async (code: string) => {
    return executePrismaQuery(() =>
      prisma.province.findUnique({
        where: { code },
        select: PROVINCE_SELECT_FIELDS,
      }),
    )
  }

  findById = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.province.findUnique({
        where: { id },
        select: PROVINCE_SELECT_FIELDS,
      }),
    )
  }
}

export const provinceRepository = new ProvinceRepository()
