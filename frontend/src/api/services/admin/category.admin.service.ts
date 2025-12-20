import type {
    IApiResponse,
    IPaginatedResponse,
} from '@/interfaces/base-response.interface'
import type { Category } from '@/interfaces/category.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { adminApi } from '../..'

export interface GetCategoriesParams extends PaginationParams {
  filters?: {
    slug?: string
    name?: string
  }
}

class AdminCategoryService {
  static getPaginated = async (params: GetCategoriesParams) => {
    const { data } = await adminApi.get<IPaginatedResponse<Category>>(
      '/categories',
      {
        params,
      },
    )
    return data
  }

  static getById = async (id: number) => {
    const { data } = await adminApi.get<IApiResponse<Category>>(
      `/categories/${id}`,
    )
    return data
  }

  static create = async (categoryData: Partial<Category>) => {
    const { data } = await adminApi.post<IApiResponse<Category>>(
      '/categories',
      categoryData,
    )
    return data
  }

  static update = async (id: number, categoryData: Partial<Category>) => {
    const { data } = await adminApi.put<IApiResponse<Category>>(
      `/categories/${id}`,
      categoryData,
    )
    return data
  }

  static delete = async (id: number) => {
    const { data } = await adminApi.delete<IApiResponse<Category>>(
      `/categories/${id}`,
    )
    return data
  }

  static softDelete = async (id: number) => {
    const { data } = await adminApi.delete<IApiResponse<Category>>(
      `/categories/${id}/soft`,
    )
    return data
  }

  static bulkDelete = async (ids: number[]) => {
    const { data } = await adminApi.post<IApiResponse<null>>(
      '/categories/bulk-delete',
      { ids },
    )
    return data
  }
}

export default AdminCategoryService
