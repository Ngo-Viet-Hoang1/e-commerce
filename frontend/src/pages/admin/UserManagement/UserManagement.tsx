import AdminUserService from '@/api/services/admin/user.admin.service'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  createModalState,
  isDeleteMode,
  type ModalState,
} from '@/interfaces/modal.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import type { User } from '@/interfaces/user.interface'
import { useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  DataTable,
  type DataTableRef,
} from '../../../components/common/table/DataTable'
import createUserColumns from './Columns'
import { useDeleteUser } from './hooks/useUserMutations'

const UserManagement = () => {
  const tableRef = useRef<DataTableRef>(null)
  const [modalState, setModalState] = useState<ModalState<User>>(null)
  const { deleteUser, isDeleting } = useDeleteUser({
    onSuccess: () => {
      tableRef.current?.refetch()
      handleCloseModal()
      toast.success('User deleted successfully')
    },
  })

  const fetchData = useCallback((params: PaginationParams) => {
    return AdminUserService.getPaginated(params)
  }, [])

  const handleOpenDeleteUserModal = useCallback((user: User) => {
    setModalState(createModalState.delete(user))
  }, [])

  const handleConfirmDelete = async () => {
    if (!isDeleteMode(modalState)) return

    await deleteUser(modalState.data.id)
  }

  const handleCloseModal = useCallback(() => {
    setModalState(createModalState.close())
  }, [])

  const userColumns = useMemo(
    () =>
      createUserColumns({
        onDelete: handleOpenDeleteUserModal,
      }),

    [handleOpenDeleteUserModal],
  )

  return (
    <>
      <DataTable
        ref={tableRef}
        fetchData={fetchData}
        columns={userColumns}
        searchPlaceholder="Search by email or name..."
      />

      {/* Delete Confirmation */}
      {isDeleteMode(modalState) && (
        <ConfirmDialog
          open={true}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDelete}
          title="Delete User"
          description={
            <div>
              <p>
                Are you sure you want to delete{' '}
                <span className="font-semibold">{modalState.data.email}?</span>
              </p>
              <p className="text-muted-foreground text-sm">
                (<span className="text-red-500">*</span>This action cannot be
                undone.)
              </p>
            </div>
          }
          confirmText="Delete"
          variant="destructive"
          isLoading={isDeleting}
        />
      )}
    </>
  )
}

export default UserManagement
