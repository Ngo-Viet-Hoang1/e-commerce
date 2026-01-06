import type {
  IApiResponse,
  IPaginatedResponse,
} from '@/interfaces/base-response.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import type { Brand } from '@/interfaces/brand.interface'
import { api } from '../..'

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
