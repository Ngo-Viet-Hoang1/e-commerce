import type { IApiResponse } from '@/shared/types'
import type { UpdateUserPayload } from '@/entities/user'
import type { Product } from '@/entities/product'
import { api } from '@/shared/api'

class UserService {
  static updateProfile = async (id: number, data: UpdateUserPayload) => {
    const { data: response } = await api.put<IApiResponse>(`/users/${id}`, data)
    return response
  }

  static getFavorites = async () => {
    const { data } = await api.get<IApiResponse<Product[]>>('/users/favorites')
    return data
  }

  static addToFavorites = async (productId: number) => {
    const { data } = await api.post<IApiResponse>(`/users/favorites/${productId}`)
    return data
  }

  static removeFromFavorites = async (productId: number) => {
    const { data } = await api.delete<IApiResponse>(`/users/favorites/${productId}`)
    return data
  }
}

export default UserService
