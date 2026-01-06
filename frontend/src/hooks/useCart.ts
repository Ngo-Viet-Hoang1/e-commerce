import CartService from '@/api/services/user/cart.service'
import type {
  AddToCartInput,
  Cart,
  RemoveCartItemInput,
  UpdateCartItemInput,
} from '@/interfaces/cart.interface'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/zustand/useAuthStore'

export const CART_QUERY_KEY = ['cart'] as const

export const useCart = (): UseQueryResult<Cart, Error> => {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      const response = await CartService.getCart()
      return response.data!
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: isAuthenticated, // Only fetch when authenticated
  })
}

export const useAddToCart = (): UseMutationResult<
  Cart,
  Error,
  AddToCartInput
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AddToCartInput) => {
      const response = await CartService.addToCart(input)
      return response.data!
    },
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEY, data)
      toast.success('Đã thêm vào giỏ hàng')
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể thêm sản phẩm vào giỏ hàng')
    },
  })
}

export const useUpdateCartItem = (): UseMutationResult<
  Cart,
  Error,
  { productId: number; variantId: number; input: UpdateCartItemInput }
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      productId,
      variantId,
      input,
    }: {
      productId: number
      variantId: number
      input: UpdateCartItemInput
    }) => {
      const response = await CartService.updateCartItem(
        productId,
        variantId,
        input,
      )
      return response.data!
    },
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEY, data)
      toast.success('Đã cập nhật giỏ hàng')
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể cập nhật giỏ hàng')
    },
  })
}

export const useRemoveCartItem = (): UseMutationResult<
  Cart,
  Error,
  RemoveCartItemInput
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: RemoveCartItemInput) => {
      const response = await CartService.removeCartItem(input)
      return response.data!
    },
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEY, data)
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể xóa sản phẩm')
    },
  })
}

export const useClearCart = (): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await CartService.clearCart()
    },
    onSuccess: () => {
      queryClient.setQueryData(CART_QUERY_KEY, {
        items: [],
        summary: {
          itemCount: 0,
          totalQuantity: 0,
          subtotal: 0,
          hasPriceChanges: false,
          hasOutOfStock: false,
        },
        updatedAt: new Date().toISOString(),
      })
      toast.success('Đã xóa giỏ hàng')
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể xóa giỏ hàng')
    },
  })
}
