import type { Me } from '@/interfaces/auth.interface'
import type { IApiResponse } from '@/interfaces/base-response.interface'
import type { LoginInputs } from '@/schema/auth.schema'
import { adminApi } from '../..'

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
