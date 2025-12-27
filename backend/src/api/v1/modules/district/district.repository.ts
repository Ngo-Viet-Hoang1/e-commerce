import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

export const DISTRICT_SELECT_FIELDS = {
  id: true,
  code: true,
  name: true,
  nameEn: true,
  fullName: true,
  fullNameEn: true,
  codeName: true,
  provinceCode: true,
  administrativeUnitId: true,
  administrativeUnitShortName: true,
  administrativeUnitFullName: true,
  administrativeUnitShortNameEn: true,
  administrativeUnitFullNameEn: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.DistrictSelect

class DistrictRepository {
  findMany = async (params: {
    where?: Prisma.DistrictWhereInput
    orderBy?: Prisma.DistrictOrderByWithRelationInput
    skip?: number
    take?: number
  }) => {
    return executePrismaQuery(() =>
      prisma.district.findMany({
        ...params,
        select: DISTRICT_SELECT_FIELDS,
      }),
    )
  }

  count = async (where?: Prisma.DistrictWhereInput) => {
    return executePrismaQuery(() => prisma.district.count({ where }))
  }

  findByCode = async (code: string) => {
    return executePrismaQuery(() =>
      prisma.district.findUnique({
        where: { code },
        select: DISTRICT_SELECT_FIELDS,
      }),
    )
  }

  findById = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.district.findUnique({
        where: { id },
        select: DISTRICT_SELECT_FIELDS,
      }),
    )
  }

  findByProvinceCode = async (
    provinceCode: string,
    params?: {
      orderBy?: Prisma.DistrictOrderByWithRelationInput
      skip?: number
      take?: number
    },
  ) => {
    return executePrismaQuery(() =>
      prisma.district.findMany({
        where: { provinceCode },
        ...params,
        select: DISTRICT_SELECT_FIELDS,
      }),
    )
  }

  countByProvinceCode = async (provinceCode: string) => {
    return executePrismaQuery(() =>
      prisma.district.count({ where: { provinceCode } }),
    )
  }
}

export const districtRepository = new DistrictRepository()
