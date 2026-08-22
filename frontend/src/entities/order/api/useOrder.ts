import UserOrderService from './order.user.service'
import type { CreateOrderPayload } from '@/entities/order'
import type { PaginationParams } from '@/shared/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const ORDER_QUERY_KEYS = {
  all: ['user-orders'] as const,
  lists: () => [...ORDER_QUERY_KEYS.all, 'list'] as const,
  list: (params?: PaginationParams | Record<string, unknown>) =>
    [...ORDER_QUERY_KEYS.lists(), params] as const,
  details: () => [...ORDER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...ORDER_QUERY_KEYS.details(), id] as const,
}

// ─── Mutations ──────────────────────────────────────────────

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data,
      idempotencyKey,
    }: {
      data: CreateOrderPayload
      idempotencyKey: string
    }) => UserOrderService.createOrder(data, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.lists() })
      toast.success('Đơn hàng được tạo thành công!')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Tạo đơn hàng thất bại')
    },
  })
}

export function useCancelUserOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: number) => UserOrderService.cancelMyOrder(orderId),

    onSuccess: (_, orderId) => {
      toast.success('Đơn hàng đã được hủy thành công')

      queryClient.invalidateQueries({
        queryKey: ORDER_QUERY_KEYS.detail(orderId),
      })
      queryClient.invalidateQueries({
        queryKey: ORDER_QUERY_KEYS.lists(),
      })
    },

    onError: () => {
      toast.error('Hủy đơn hàng thất bại')
    },
  })
}

// ─── Queries ────────────────────────────────────────────────

export function useUserOrders(params: PaginationParams) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.list(params),
    queryFn: () => UserOrderService.getMyOrders(params),
    placeholderData: (previousData) => previousData,
  })
}

export function useUserOrderById(
  orderId: number,
  options?: { refetchInterval?: number | false },
) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.detail(orderId),
    queryFn: () => UserOrderService.getMyOrderById(orderId),
    enabled: !!orderId,
    refetchInterval: options?.refetchInterval,
  })
}
