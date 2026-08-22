import { AdminBadgeService } from '@/entities/badge'
import type { Badge } from '@/entities/badge'
import type { PaginationParams } from '@/shared/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { UpdateBadgeInputs } from '../model/badge.schema'

const queryKeys = {
  badges: {
    all: ['badges'] as const,
    lists: () => [...queryKeys.badges.all, 'list'] as const,
    list: (params: PaginationParams) =>
      [...queryKeys.badges.lists(), params] as const,
    details: () => [...queryKeys.badges.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.badges.details(), id] as const,
  },
}

export const useBadges = (params: PaginationParams) => {
  return useQuery({
    queryKey: queryKeys.badges.list(params),
    queryFn: () => AdminBadgeService.getPaginated(params),

    placeholderData: (previousData) => previousData,
  })
}

export const useBadge = (id: number) => {
  return useQuery({
    queryKey: queryKeys.badges.detail(id),
    queryFn: () => AdminBadgeService.getById(id),
    enabled: !!id,
  })
}

export const useCreateBadge = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (badgeData: Partial<Badge>) =>
      AdminBadgeService.create(badgeData),

    onSuccess: () => {
      toast.success('Badge created successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.badges.lists() })
    },

    onError: () => {
      toast.error('Failed to create badge')
    },
  })
}

export const useUpdateBadge = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBadgeInputs }) =>
      AdminBadgeService.update(id, data),

    onSuccess: (_, { id }) => {
      toast.success('Badge updated successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.badges.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.badges.detail(id) })
    },

    onError: () => {
      toast.error('Failed to update badge')
    },
  })
}

export const useDeleteBadge = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => AdminBadgeService.delete(id),

    onSuccess: () => {
      toast.success('Badge deleted permanently')
      queryClient.invalidateQueries({ queryKey: queryKeys.badges.lists() })
    },

    onError: () => {
      toast.error('Failed to delete badge')
    },
  })
}

