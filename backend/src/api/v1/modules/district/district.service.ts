import type { Prisma } from '@generated/prisma/client'
import { NotFoundException } from '../../shared/models/app-error.model'
import { districtRepository } from './district.repository'
import type { ListDistrictsQuery } from './district.schema'

class DistrictService {
  findAll = async (query: ListDistrictsQuery) => {
    const { page, limit, sort, order, search, provinceCode } = query

    const where: Prisma.DistrictWhereInput = {
      ...(provinceCode && { provinceCode }),
      ...(search && {
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { nameEn: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [districts, total] = await Promise.all([
      districtRepository.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      districtRepository.count(where),
    ])

    return { districts, total, page, limit }
  }

  findByCode = async (code: string) => {
    const district = await districtRepository.findByCode(code)

    if (!district) {
      throw new NotFoundException('District', code)
    }

    return district
  }

  findByProvinceCode = async (provinceCode: string) => {
    const districts = await districtRepository.findByProvinceCode(
      provinceCode,
      {
        orderBy: { code: 'asc' },
      },
    )

    return districts
  }

  findAll_simple = async () => {
    const districts = await districtRepository.findMany({
      orderBy: { code: 'asc' },
    })

    return districts
  }
}

export const districtService = new DistrictService()
