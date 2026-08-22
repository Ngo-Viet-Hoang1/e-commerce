import type {
  IApiResponse,
  IPaginatedResponse,
} from '@/shared/types'
import type { PaginationParams } from '@/shared/types'
import type { Category } from '@/entities/category'
import { api } from '@/shared/api'

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
