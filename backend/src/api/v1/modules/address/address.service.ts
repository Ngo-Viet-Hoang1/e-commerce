import type { Prisma } from '@generated/prisma/client'
import { NotFoundException } from '../../shared/models/app-error.model'
import { addressRepository } from './address.repository'
import {
  type CreateAddressBody,
  type UpdateAddressBody,
  type ListAddressesQuery,
} from './address.schema'

class AddressService {
  findAll = async (userId: number, query: ListAddressesQuery) => {
    const { page, limit, isDefault } = query

    const where: Prisma.AddressWhereInput = {
      userId,
      ...(isDefault !== undefined && { isDefault }),
    }

    const [addresses, total] = await Promise.all([
      addressRepository.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      }),
      addressRepository.count(where),
    ])

    return { addresses, total, page, limit }
  }

  private findByIdAndUser = async (id: number, userId: number) => {
    const address = await addressRepository.findById(id)

    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address', id.toString())
    }

    return address
  }

  findById = async (id: number, userId: number) => {
    return this.findByIdAndUser(id, userId)
  }

  create = async (userId: number, data: CreateAddressBody) => {
    if (data.isDefault === true) {
      await addressRepository.clearDefaultByUser(userId)
    }

    return addressRepository.create({
      detail: data.detail,
      isDefault: data.isDefault ?? false,

      user: {
        connect: { id: userId },
      },

      province: {
        connect: { code: data.provinceCode },
      },

      district: {
        connect: { code: data.districtCode },
      },
    })
  }

  updateById = async (id: number, userId: number, data: UpdateAddressBody) => {
    await this.findByIdAndUser(id, userId)

    if (data.isDefault === true) {
      await addressRepository.clearDefaultByUser(userId)
    }

    return addressRepository.update(id, {
      ...(data.detail !== undefined && { detail: data.detail }),
      ...(data.isDefault !== undefined && { isDefault: data.isDefault }),

      ...(data.districtCode !== undefined && {
        district: {
          connect: { code: data.districtCode },
        },
      }),

      ...(data.provinceCode !== undefined && {
        province: {
          connect: { code: data.provinceCode },
        },
      }),
    })
  }

  deleteById = async (id: number, userId: number) => {
    await this.findByIdAndUser(id, userId)
    return addressRepository.deleteById(id)
  }

  setDefaultById = async (id: number, userId: number) => {
    await this.findByIdAndUser(id, userId)

    await addressRepository.clearDefaultByUser(userId)

    return addressRepository.update(id, {
      isDefault: true,
    })
  }
}

export const addressService = new AddressService()
