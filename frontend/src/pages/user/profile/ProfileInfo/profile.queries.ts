import UserService from '@/api/services/user/user.service'
import type { UpdateUserPayload } from '@/interfaces/user.interface'
import { useAuthStore } from '@/store/zustand/useAuthStore'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useUpdateProfile = () => {
  const { initializeAuth } = useAuthStore()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserPayload }) =>
      UserService.updateProfile(id, data),
    onSuccess: async () => {
      await initializeAuth()
      toast.success('Cập nhật thông tin thành công')
    },
    onError: () => {
      toast.error('Cập nhật thông tin thất bại')
    },
  })
}
