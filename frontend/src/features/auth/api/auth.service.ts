import type { Me } from '@/features/auth'
import type { IApiResponse } from '@/shared/types'
import type { LoginInputs } from '@/shared/types/auth.schema'
import { api } from '@/shared/api'

class AuthService {
  static register = async (userData: {
    email: string
    password: string
    username?: string
  }) => {
    const { data } = await api.post('/auth/register', userData)
    return data
  }

  static login = async (credentials: LoginInputs) => {
    const { data } = await api.post<IApiResponse<{ accessToken: string }>>(
      '/auth/login',
      credentials,
    )
    return data
  }

  static getMe = async () => {
    const { data } = await api.get<IApiResponse<{ me: Me }>>('/auth/me')
    return data
  }

  static logout = async () => {
    const { data } = await api.post<IApiResponse>('/auth/logout')
    return data
  }
}

export default AuthService
