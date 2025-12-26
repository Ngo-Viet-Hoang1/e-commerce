import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/table/DataTable'
import {
  createModalState,
  isCreateMode,
  isDeleteMode,
  isEditMode,
  type ModalState,
} from '@/interfaces/modal.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import type { User } from '@/interfaces/user.interface'
import { useState } from 'react'
import createUserColumns from './Columns'
import { CreateUserForm } from './CreateUserForm'
import { EditUserForm } from './EditUserForm'
import { useDeleteUser, useUsers } from './user.queries'
import UserTableToolbar from './UserTableToolbar'

const UserManagement = () => {
  const [modalState, setModalState] = useState<ModalState<User>>(null)
  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    limit: 10,
  })

  const usersQuery = useUsers(params)

  const deleteMutation = useDeleteUser()

  const columns = createUserColumns({
    onEdit: (user) => setModalState(createModalState.edit(user)),
    onDelete: (user) => setModalState(createModalState.delete(user)),
  })

  return (
    <>
      <DataTable
        columns={columns}
        query={usersQuery}
        onParamsChange={setParams}
        searchPlaceholder="Search by email or name..."
        renderToolbar={() => (
          <UserTableToolbar
            onCreate={() => setModalState(createModalState.create())}
          />
        )}
      />

      {isCreateMode(modalState) && (
        <CreateUserForm open onClose={() => setModalState(null)} />
      )}

      {isEditMode(modalState) && (
        <EditUserForm
          open
          userId={modalState.data.id}
          onClose={() => setModalState(null)}
        />
      )}

      {/* Delete Confirmation */}
      {isDeleteMode(modalState) && (
        <ConfirmDialog
          open
          onClose={() => setModalState(null)}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(modalState.data.id)
            setModalState(null)
          }}
          title="Delete User"
          description={`Are you sure you want to delete ${modalState.data.email}?`}
          confirmText="Delete"
          variant="destructive"
          isLoading={deleteMutation.isPending}
        />
      )}
    </>
  )
}

export default UserManagement
