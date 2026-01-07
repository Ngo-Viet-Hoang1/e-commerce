import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

export const ADDRESS_SELECT_FIELDS = {
  id: true,
  userId: true,
  districtCode: true,
  provinceCode: true,
  detail: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
  district: {
    select: {
      id: true,
      code: true,
      name: true,
    },
  },
  province: {
    select: {
      id: true,
      code: true,
      name: true,
    },
  },
} as const

class AddressRepository {
  findById = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.address.findUnique({
        where: { id },
        select: ADDRESS_SELECT_FIELDS,
      }),
    )
  }

  findMany = async (params: Prisma.AddressFindManyArgs) => {
    return executePrismaQuery(() =>
      prisma.address.findMany({
        ...params,
        select: ADDRESS_SELECT_FIELDS,
      }),
    )
  }

  count = async (where: Prisma.AddressWhereInput) => {
    return executePrismaQuery(() => prisma.address.count({ where }))
  }

  create = async (data: Prisma.AddressCreateInput) => {
    return executePrismaQuery(() =>
      prisma.address.create({
        data,
        select: ADDRESS_SELECT_FIELDS,
      }),
    )
  }

  update = async (id: number, data: Prisma.AddressUpdateInput) => {
    return executePrismaQuery(() =>
      prisma.address.update({
        where: { id },
        data,
        select: ADDRESS_SELECT_FIELDS,
      }),
    )
  }

  deleteById = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.address.delete({
        where: { id },
        select: ADDRESS_SELECT_FIELDS,
      }),
    )
  }

  clearDefaultByUser = async (userId: number) => {
    return executePrismaQuery(() =>
      prisma.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      }),
    )
  }
}

export const addressRepository = new AddressRepository()
