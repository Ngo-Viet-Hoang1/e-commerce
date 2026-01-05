import type { IApiResponse } from '@/interfaces/base-response.interface'
import type { UpdateUserPayload } from '@/interfaces/user.interface'
import { api } from '../..'

class UserService {
  static updateProfile = async (id: number, data: UpdateUserPayload) => {
    const { data: response } = await api.put<IApiResponse>(`/users/${id}`, data)
    return response
  }
}

export default UserService
