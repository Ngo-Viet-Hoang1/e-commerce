import UserOrderService from '@/api/services/user/order.user.service'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const userOrderKeys = {
  all: ['user-orders'] as const,
  lists: () => [...userOrderKeys.all, 'list'] as const,
  list: (params: PaginationParams) =>
    [...userOrderKeys.lists(), params] as const,
  details: () => [...userOrderKeys.all, 'detail'] as const,
  detail: (id: number) => [...userOrderKeys.details(), id] as const,
}

export const useUserOrders = (params: PaginationParams) => {
  return useQuery({
    queryKey: userOrderKeys.list(params),
    queryFn: () => UserOrderService.getMyOrders(params),
    placeholderData: (previousData) => previousData,
  })
}

export const useUserOrder = (orderId: number) => {
  return useQuery({
    queryKey: userOrderKeys.detail(orderId),
    queryFn: () => UserOrderService.getMyOrderById(orderId),
    enabled: !!orderId,
  })
}

export const useCancelUserOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: number) => UserOrderService.cancelMyOrder(orderId),

    onSuccess: (_, orderId) => {
      toast.success('Order cancelled successfully')

      queryClient.invalidateQueries({
        queryKey: userOrderKeys.detail(orderId),
      })

      queryClient.invalidateQueries({
        queryKey: userOrderKeys.lists(),
      })
    },

    onError: () => {
      toast.error('Failed to cancel order')
    },
  })
}
