import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orderApi } from '@/api/services/user/order.service'
import type { CreateOrderPayload } from '@/interfaces/order.interface'

export const ORDER_QUERY_KEYS = {
  all: ['orders'] as const,
  lists: () => [...ORDER_QUERY_KEYS.all, 'list'] as const,
  list: (params?: Record<string, unknown>) =>
    [...ORDER_QUERY_KEYS.lists(), params] as const,
  details: () => [...ORDER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...ORDER_QUERY_KEYS.details(), id] as const,
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOrderPayload) => orderApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.lists() })
      toast.success('Đơn hàng được tạo thành công!')
    },
  })
}

export function useUserOrders(params?: {
  page?: number
  limit?: number
  status?: string
}) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.list(params),
    queryFn: () => orderApi.getUserOrders(params),
  })
}

export function useUserOrderById(orderId: number) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.detail(orderId),
    queryFn: () => orderApi.getUserOrderById(orderId),
    enabled: !!orderId,
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: number) => orderApi.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.lists() })
      toast.success('Đơn hàng đã được hủy thành công')
    },
  })
}
