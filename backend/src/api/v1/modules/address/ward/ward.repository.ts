import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../../shared/config/database/postgres'
import { executePrismaQuery } from '../../../shared/utils/prisma-error.util'


export const WARD_SELECT_FIELDS = {
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
  province: {
    select: {
      id: true,
      code: true,
      name: true,
      fullName: true,
      codeName: true,
    },
  },
} as const satisfies Prisma.WardSelect

class WardRepository {
  findById = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.ward.findUnique({
        where: { id },
        select: WARD_SELECT_FIELDS,
      }),
    )
  }
  
  findByCode = async (code: string) => {
    return executePrismaQuery(() =>
      prisma.ward.findUnique({
        where: { code },
        select: WARD_SELECT_FIELDS,
      }),
    )
  }

  findByName = async (name: string) => {
    return executePrismaQuery(() =>
      prisma.ward.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
        select: WARD_SELECT_FIELDS,
      }),
    )
  }

  findManyByProvinceCode = async (provinceCode: string) => {
    return executePrismaQuery(() =>
      prisma.ward.findMany({
        where: { provinceCode },
        select: WARD_SELECT_FIELDS,
        orderBy: { name: 'asc' },
      }),
    )
  }

  findMany = async (params: {
    where?: Prisma.WardWhereInput
    orderBy?: Prisma.WardOrderByWithRelationInput
    skip?: number
    take?: number
  }) => {
    return executePrismaQuery(() =>
      prisma.ward.findMany({
        ...params,
        select: WARD_SELECT_FIELDS,
      }),
    )
  }

  count = async (where?: Prisma.WardWhereInput) => {
    return executePrismaQuery(() => prisma.ward.count({ where }))
  }

  
  existsById = async (id: number) => {
    const count = await this.count({ id })
    return count > 0
  }

  existsByCode = async (code: string) => {
    const count = await this.count({ code })
    return count > 0
  }
}

export const wardRepository = new WardRepository()
export default wardRepository