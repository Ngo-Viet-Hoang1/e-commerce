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

  static updateById = async (id: number, updates: Partial<Order>) => {
    const { data } = await adminApi.put<IApiResponse<Order>>(
      `/orders/${id}`,
      updates,
    )
    return data
  }

  static exportOrderPDF = async (orderId: number): Promise<Blob> => {
    try {
      const response = await adminApi.get(`/orders/${orderId}/export-pdf`, {
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

export default AdminOrderService
