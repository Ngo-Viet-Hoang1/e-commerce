import type { Prisma } from '@generated/prisma/client'
import { NotFoundException } from '../../shared/models/app-error.model'
import { provinceRepository } from './province.repository'
import type { ListProvincesQuery } from './province.schema'

class ProvinceService {
  findAll = async (query: ListProvincesQuery) => {
    const { page, limit, sort, order, search } = query

    const where: Prisma.ProvinceWhereInput = {
      ...(search && {
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { nameEn: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [provinces, total] = await Promise.all([
      provinceRepository.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      provinceRepository.count(where),
    ])

    return { provinces, total, page, limit }
  }

  findByCode = async (code: string) => {
    const province = await provinceRepository.findByCode(code)

    if (!province) {
      throw new NotFoundException('Province', code)
    }

    return province
  }

  findAll_simple = async () => {
    const provinces = await provinceRepository.findMany({
      orderBy: { code: 'asc' },
    })

    return provinces
  }
}

export const provinceService = new ProvinceService()
