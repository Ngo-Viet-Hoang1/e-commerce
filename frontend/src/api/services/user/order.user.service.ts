import type {
  IApiResponse,
  IPaginatedResponse,
} from '@/interfaces/base-response.interface'
import type { CreateOrderPayload, Order } from '@/interfaces/order.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { api } from '../..'

class UserOrderService {
  static createOrder = async (payload: CreateOrderPayload) => {
    const { data } = await api.post<IApiResponse<Order>>(
      '/me/orders',
      payload,
    )
    return data.data!
  }

  static getMyOrders = async (params: PaginationParams) => {
    const { data } = await api.get<IPaginatedResponse<Order>>('/me/orders', {
      params,
    })
    return data
  }

  static getMyOrderById = async (orderId: number) => {
    const { data } = await api.get<IApiResponse<Order>>(
      `/me/orders/${orderId}`,
    )
    return data.data!
  }

  static cancelMyOrder = async (orderId: number) => {
    const { data } = await api.post<IApiResponse<Order>>(
      `/me/orders/${orderId}/cancel`,
    )
    return data.data!
  }

  static exportOrderPDF = async (orderId: number): Promise<Blob> => {
    try {
      const response = await api.get(`/me/orders/${orderId}/pdf`, {
        responseType: 'blob',
      })
      return response.data
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: Blob } }
      if (axiosError.response?.data instanceof Blob) {
        const text = await axiosError.response.data.text()
        try {
          const jsonError = JSON.parse(text)
          throw new Error(jsonError.message ?? 'Failed to export PDF')
        } catch {
          throw new Error('Failed to export PDF')
        }
      }
      throw error
    }
  }
}

export default UserOrderService
