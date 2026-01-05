import type { IApiResponse } from '@/interfaces/base-response.interface'
import type { UpdateUserPayload } from '@/interfaces/user.interface'
import type { Product } from '@/interfaces/product.interface'
import { api } from '../..'

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
