import UserService from '@/api/services/user/user.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/zustand/useAuthStore'
import { toast } from 'sonner'

export const FAVORITES_QUERY_KEY = ['favorites']

export const useFavoriteProducts = () => {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: UserService.getFavorites,
    enabled: isAuthenticated,
  })
}

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: number) =>
      UserService.removeFromFavorites(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY })
      toast.success('Đã xóa khỏi danh sách yêu thích')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa sản phẩm')
    },
  })
}

export const useAddFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: number) => UserService.addToFavorites(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY })
      toast.success('Đã thêm vào danh sách yêu thích')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi thêm sản phẩm')
    },
  })
}
