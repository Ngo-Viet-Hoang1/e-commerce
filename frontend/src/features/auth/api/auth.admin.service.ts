import type { Me } from '@/features/auth'
import type { IApiResponse } from '@/shared/types'
import type { LoginInputs } from '@/shared/types/auth.schema'
import { adminApi } from '@/shared/api'

class AdminAuthService {
  static login = async (credentials: LoginInputs) => {
    const { data } = await adminApi.post<IApiResponse<{ accessToken: string }>>(
      '/admin/auth/login',
      credentials,
    )
    return data
  }

  static getMe = async () => {
    const { data } =
      await adminApi.get<IApiResponse<{ me: Me }>>('/admin/auth/me')
    return data
  }

  static logout = async () => {
    const { data } = await adminApi.post<IApiResponse>('/admin/auth/logout')
    return data
  }
}

export default AdminAuthService
