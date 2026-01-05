import type {
  IApiResponse,
  IPaginatedResponse,
} from '@/interfaces/base-response.interface'
import type { Order } from '@/interfaces/order.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { api } from '../..'

class UserOrderService {
  static getMyOrders = async (params: PaginationParams) => {
    const { data } = await api.get<IPaginatedResponse<Order>>('/users/orders', {
      params,
    })
    return data
  }

  static getMyOrderById = async (orderId: number) => {
    const { data } = await api.get<IApiResponse<Order>>(
      `/users/orders/${orderId}`,
    )
    return data
  }

  static cancelMyOrder = async (orderId: number) => {
    const { data } = await api.put<IApiResponse<Order>>(
      `/users/orders/${orderId}/cancel`,
    )
    return data
  }
}

export default UserOrderService
