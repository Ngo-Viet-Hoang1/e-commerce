import type { IApiResponse } from '@/interfaces/base-response.interface'
import { adminApi } from '../..'
import type { User } from '@/interfaces/user.interface'

class AdminUserService {
  static getAll = async () => {
    const { data } = await adminApi.get<IApiResponse<User[]>>('/users')
    return data
  }
}

export default AdminUserService
