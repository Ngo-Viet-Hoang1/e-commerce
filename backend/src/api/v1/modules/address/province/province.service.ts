import type {
  ListProvincesQuery,
} from './province.schema'
import { provinceRepository } from './province.repository'

class ProvinceService {
  
  findAll = async (query: ListProvincesQuery) => {
    const {
      page = 1,
      limit = 10,
      sort,
      order = 'asc',
      name,
      code,
      search,
    } = query

    const where: any = {}
    if (name) where.name = { contains: name, mode: 'insensitive' }
    if (code) where.code = { contains: code, mode: 'insensitive' }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [provinces, total] = await Promise.all([
      provinceRepository.findMany({
        where,
        orderBy: sort ? { [sort]: order } : { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      provinceRepository.count(where),
    ])

    return {
      provinces,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Lấy tỉnh theo ID
   */
  findById = async (id: number) => {
    const province = await provinceRepository.findById(id)
    if (!province) throw new Error('Province not found')
    return province
  }

  /**
   * Lấy tỉnh theo mã tỉnh (code)
   */
  findByCode = async (code: string) => {
    const province = await provinceRepository.findByCode(code.toUpperCase())
    if (!province) throw new Error('Province not found')
    return province
  }

  /**
   * Lấy tất cả tỉnh (không phân trang) - dùng cho dropdown checkout
   */
  getAll = async () => {
    return provinceRepository.getAll()
  }
}

export const provinceService = new ProvinceService()
export default provinceService