import type {
  IApiResponse,
  IPaginatedResponse,
} from '@/interfaces/base-response.interface'
import type { User } from '@/interfaces/user.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { adminApi } from '../..'

export interface GetUsersParams extends PaginationParams {
  filters?: {
    status?: 'active' | 'inactive' | 'deleted'
    emailVerified?: boolean
    isMfaActive?: boolean
    isActive?: boolean
    googleId?: string | null
  }
}

class AdminUserService {
  static getPaginated = async (params: GetUsersParams) => {
    const { data } = await adminApi.get<IPaginatedResponse<User>>('/users', {
      params,
    })
    return data
  }

  static getById = async (id: number) => {
    const { data } = await adminApi.get<IApiResponse<User>>(`/users/${id}`)
    return data
  }

  static create = async (userData: Partial<User>) => {
    const { data } = await adminApi.post<IApiResponse<User>>('/users', userData)
    return data
  }

  static update = async (id: number, userData: Partial<User>) => {
    const { data } = await adminApi.put<IApiResponse<User>>(
      `/users/${id}`,
      userData,
    )
    return data
  }

  static delete = async (id: number) => {
    const { data } = await adminApi.delete<IApiResponse<User>>(`/users/${id}`)
    return data
  }

  static softDelete = async (id: number) => {
    const { data } = await adminApi.delete<IApiResponse<User>>(
      `/users/${id}/soft`,
    )
    return data
  }

  static bulkDelete = async (ids: number[]) => {
    const { data } = await adminApi.post<IApiResponse<null>>(
      '/users/bulk-delete',
      { ids },
    )
    return data
  }
}

export default AdminUserService
