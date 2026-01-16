import AdminOrderService from '@/api/services/admin/order.admin.service'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const queryKeys = {
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (params: PaginationParams) =>
      [...queryKeys.orders.lists(), params] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.orders.details(), id] as const,
  },
}

export const useOrders = (params: PaginationParams) => {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => AdminOrderService.getPaginated(params),
    placeholderData: (previousData) => previousData,
  })
}

export const useOrder = (id: number) => {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => AdminOrderService.getById(id),
    enabled: !!id,
  })
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      status,
      paymentStatus,
    }: {
      id: number
      status?: string
      paymentStatus?: string
    }) => AdminOrderService.updateById(id, { status, paymentStatus }),

    onSuccess: (_, { id }) => {
      toast.success('Cập nhật đơn hàng thành công')

      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.detail(id),
      })

      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.lists(),
      })
    },

    onError: () => {
      toast.error('Cập nhật đơn hàng thất bại')
    },
  })
}
