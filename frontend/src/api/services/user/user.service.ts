import type { IApiResponse } from '@/interfaces/base-response.interface'
import type { UpdateUserDto } from '@/interfaces/user.interface'
import { api } from '../..'

class UserService {
  static updateProfile = async (id: number, data: UpdateUserDto) => {
    const { data: response } = await api.put<IApiResponse>(`/users/${id}`, data)
    return response
  }
}

export default UserService
