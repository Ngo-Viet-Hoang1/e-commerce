import { api } from '../../index'
import type { CreateOrderPayload, Order } from '@/interfaces/order.interface'

export const orderApi = {
  createOrder: async (data: CreateOrderPayload) => {
    const response = await api.post<{ data: Order }>(
      '/orders/user/orders',
      data,
    )
    return response.data.data
  },

  getUserOrders: async (params?: {
    page?: number
    limit?: number
    status?: string
  }) => {
    const response = await api.get<{ data: Order[] }>('/orders/user/orders', {
      params,
    })
    return response.data.data
  },

  getUserOrderById: async (orderId: number) => {
    const response = await api.get<{ data: Order }>(
      `/orders/user/orders/${orderId}`,
    )
    return response.data.data
  },

  cancelOrder: async (orderId: number) => {
    const response = await api.post<{ data: Order }>(
      `/orders/user/orders/${orderId}/cancel`,
    )
    return response.data.data
  },
}
