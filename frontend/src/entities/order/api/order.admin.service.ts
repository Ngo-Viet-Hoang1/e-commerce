import type {
  IApiResponse,
  IPaginatedResponse,
} from '@/shared/types'
import type { Order } from '@/entities/order'
import type { PaginationParams } from '@/shared/types'
import { adminApi } from '@/shared/api'

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
    } catch (error: unknown) {
      // Handle blob error response
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

export default AdminOrderService
