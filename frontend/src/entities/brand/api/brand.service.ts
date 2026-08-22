import type {
  IApiResponse,
  IPaginatedResponse,
} from '@/shared/types'
import type { PaginationParams } from '@/shared/types'
import type { Brand } from '@/entities/brand'
import { api } from '@/shared/api'

class BrandService {
  static getPaginated = async (params: PaginationParams) => {
    const { data } = await api.get<IPaginatedResponse<Brand>>('/brands', {
      params,
    })
    return data
  }

  static getById = async (id: number) => {
    const { data } = await api.get<IApiResponse<Brand>>(`/brands/${id}`)
    return data
  }
}

export default BrandService
