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

  static exportOrderPDF = async (orderId: number): Promise<Blob> => {
    try {
      const response = await api.get(`/users/orders/${orderId}/export-pdf`, {
        responseType: 'blob',
      })
      return response.data
    } catch (error: any) {
      // Handle blob error response
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text()
        try {
          const jsonError = JSON.parse(text)
          throw new Error(jsonError.message || 'Failed to export PDF')
        } catch {
          throw new Error('Failed to export PDF')
        }
      }
      throw error
    }
  }
}

export default UserOrderService
