import type {
  IApiResponse,
  IPaginatedResponse,
} from '@/interfaces/base-response.interface'
import type { Order } from '@/interfaces/order.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { adminApi } from '../..'

export interface GetOrdersParams extends PaginationParams {
  filters?: {
    status?: string
    paymentStatus?: string
    userId?: number
  }
}

class AdminOrderService {
  static getPaginated = async (params: GetOrdersParams) => {
    const { data } = await adminApi.get<IPaginatedResponse<Order>>('/orders', {
      params,
    })
    return data
  }

  static getById = async (id: number) => {
    const { data } = await adminApi.get<IApiResponse<Order>>(`/orders/${id}`)
    return data
  }

  static updateStatus = async (id: number, status: string) => {
    const { data } = await adminApi.put<IApiResponse<Order>>(`/orders/${id}`, {
      status,
    })
    return data
  }
}

export default AdminOrderService
