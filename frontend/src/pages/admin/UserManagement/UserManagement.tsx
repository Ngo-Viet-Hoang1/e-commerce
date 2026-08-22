import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { DataTable } from '@/shared/ui/table/DataTable'
import {
  createModalState,
  isCreateMode,
  isDeleteMode,
  isEditMode,
  type ModalState,
} from '@/shared/types'
import type { PaginationParams } from '@/shared/types'
import type { User } from '@/entities/user'
import { useState } from 'react'
import createUserColumns from './Columns'
import { CreateUserForm, EditUserForm, useDeleteUser, useUsers } from '@/features/manage-user'
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
