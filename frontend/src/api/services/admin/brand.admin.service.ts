import type {
    IApiResponse,
    IPaginatedResponse,
} from '@/interfaces/base-response.interface'
import type { Brand } from '@/interfaces/brand.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { adminApi } from '../..'

export interface GetBrandsParams extends PaginationParams {
  filters?: {
    name?: string
  }
}

class AdminBrandService {
  static getPaginated = async (params: GetBrandsParams) => {
    const { data } = await adminApi.get<IPaginatedResponse<Brand>>('/brands', {
      params,
    })
    return data
  }

  static getById = async (id: number) => {
    const { data } = await adminApi.get<IApiResponse<Brand>>(`/brands/${id}`)
    return data
  }

  static create = async (brandData: Partial<Brand>) => {
    const { data } = await adminApi.post<IApiResponse<Brand>>(
      '/brands',
      brandData,
    )
    return data
  }

  static update = async (id: number, brandData: Partial<Brand>) => {
    const { data } = await adminApi.put<IApiResponse<Brand>>(
      `/brands/${id}`,
      brandData,
    )
    return data
  }

  static delete = async (id: number) => {
    const { data } = await adminApi.delete<IApiResponse<Brand>>(`/brands/${id}`)
    return data
  }

  static softDelete = async (id: number) => {
    const { data } = await adminApi.delete<IApiResponse<Brand>>(
      `/brands/${id}/soft`,
    )
    return data
  }

  static bulkDelete = async (ids: number[]) => {
    const { data } = await adminApi.post<IApiResponse<null>>(
      '/brands/bulk-delete',
      { ids },
    )
    return data
  }
}

export default AdminBrandService
