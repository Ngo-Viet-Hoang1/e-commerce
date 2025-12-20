import AdminUserService from '@/api/services/admin/user.admin.service'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const queryKeys = {
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (params: PaginationParams) =>
      [...queryKeys.users.lists(), params] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.users.details(), id] as const,
  },
}

export const useUsers = (params: PaginationParams) => {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => AdminUserService.getPaginated(params),

    placeholderData: (previousData) => previousData,
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => AdminUserService.delete(id),

    onSuccess: () => {
      toast.success('User deleted successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
    },

    onError: () => {
      toast.error('Failed to delete user')
    },
  })
}
