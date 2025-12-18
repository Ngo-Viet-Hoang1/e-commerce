import AdminUserService from '@/api/services/admin/user.admin.service'
import { useMutation } from '@/hooks/useMutation'
import type { IApiResponse } from '@/interfaces/base-response.interface'
import type { User } from '@/interfaces/user.interface'

export const useDeleteUser = ({
  onSuccess,
  onError,
  successMessage,
  errorMessage,
}: {
  onSuccess?: () => void
  onError?: () => void
  successMessage?: string
  errorMessage?: string
}) => {
  const { mutate: deleteUser, isLoading: isDeleting } = useMutation<
    IApiResponse<User>,
    number
  >({
    mutationFn: (id) => AdminUserService.delete(id),
    onSuccess,
    onError,
    successMessage,
    errorMessage,
  })

  return { deleteUser, isDeleting }
}
