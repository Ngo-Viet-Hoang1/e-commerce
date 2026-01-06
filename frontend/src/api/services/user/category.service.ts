import type {
  IApiResponse,
  IPaginatedResponse,
} from '@/interfaces/base-response.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import type { Category } from '@/interfaces/category.interface'
import { api } from '../..'

class CategoryService {
  static getPaginated = async (params: PaginationParams) => {
    const { data } = await api.get<IPaginatedResponse<Category>>('/categories', {
      params,
    })
    return data
  }

  static getById = async (id: number) => {
    const { data } = await api.get<IApiResponse<Category>>(
      `/categories/${id}`,
    )
    return data
  }
}

export default CategoryService
