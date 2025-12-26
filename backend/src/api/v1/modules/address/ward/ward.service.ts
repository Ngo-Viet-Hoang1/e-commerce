import type { ListWardsQuery } from './ward.schema'
import { wardRepository } from './ward.repository'

class WardService {
  findAll = async (query: ListWardsQuery) => {
    const {
      page = 1,
      limit = 50, 
      sort,
      order = 'asc',
      provinceCode,
      name,
      search,
    } = query

    const where: any = {}

    if (provinceCode) {
      where.provinceCode = provinceCode
    }

    if (name) {
      where.name = { contains: name, mode: 'insensitive' }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { code: { contains: search } },
        { codeName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const validSortFields = ['name', 'code', 'fullName', 'createdAt', 'updatedAt'] as const
    type ValidSortField = typeof validSortFields[number]

    const safeSort = sort && validSortFields.includes(sort as ValidSortField)
      ? sort as ValidSortField
      : 'name'

    const orderBy = { [safeSort]: order }

    const skip = (page - 1) * limit

    const [wards, total] = await Promise.all([
      wardRepository.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      wardRepository.count(where),
    ])

    return {
      wards,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  findByProvinceCode = async (provinceCode: string) => {
    const wards = await wardRepository.findManyByProvinceCode(provinceCode)

    if (wards.length === 0) {
      throw new Error('No wards found for this province code')
    }

    return wards
  }

  findById = async (id: number) => {
    const ward = await wardRepository.findById(id)
    if (!ward) throw new Error('Ward not found')
    return ward
  }

  findByCode = async (code: string) => {
    const ward = await wardRepository.findByCode(code)
    if (!ward) throw new Error('Ward not found')
    return ward
  }
}

export const wardService = new WardService()
export default wardService
