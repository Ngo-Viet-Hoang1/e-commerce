import AdminUserService from '@/api/services/admin/user.admin.service'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import type { User } from '@/interfaces/user.interface'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { UpdateUserInputs } from './user.schema'

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

export const useUser = (id: number) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => AdminUserService.getById(id),
    enabled: !!id,
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: Partial<User>) => AdminUserService.create(userData),

    onSuccess: () => {
      toast.success('User created successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
    },

    onError: () => {
      toast.error('Failed to create user')
    },
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserInputs }) =>
      AdminUserService.update(id, data),

    onSuccess: (_, { id }) => {
      toast.success('User updated successfully')

      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(id),
      })

      queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists(),
      })
    },

    onError: () => {
      toast.error('Failed to update user')
    },
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
