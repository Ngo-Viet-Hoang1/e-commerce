import type {
  IApiResponse,
  IPaginatedResponse,
} from '@/interfaces/base-response.interface'
import type { Badge } from '@/interfaces/badge.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { adminApi } from '../..'

export interface GetBadgesParams extends PaginationParams {
  filters?: {
    name?: string
    code?: string
  }
}

class AdminBadgeService {
  static getPaginated = async (params: GetBadgesParams) => {
    const { data } = await adminApi.get<IPaginatedResponse<Badge>>('/badges', {
      params,
    })
    return data
  }

  static getById = async (id: number) => {
    const { data } = await adminApi.get<IApiResponse<Badge>>(`/badges/${id}`)
    return data
  }

  static create = async (badgeData: Partial<Badge>) => {
    const { data } = await adminApi.post<IApiResponse<Badge>>(
      '/badges',
      badgeData,
    )
    return data
  }

  static update = async (id: number, badgeData: Partial<Badge>) => {
    const { data } = await adminApi.put<IApiResponse<Badge>>(
      `/badges/${id}`,
      badgeData,
    )
    return data
  }

  static delete = async (id: number) => {
    const { data } = await adminApi.delete<IApiResponse<Badge>>(`/badges/${id}`)
    return data
  }

  static softDelete = async (id: number) => {
    const { data } = await adminApi.delete<IApiResponse<Badge>>(
      `/badges/${id}/soft`,
    )
    return data
  }

  static restore = async (id: number) => {
    const { data } = await adminApi.post<IApiResponse<Badge>>(
      `/badges/${id}/restore`,
    )
    return data
  }
}

export default AdminBadgeService
