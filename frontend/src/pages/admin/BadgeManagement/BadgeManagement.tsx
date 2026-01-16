import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/table/DataTable'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import type { Badge } from '@/interfaces/badge.interface'
import { useState } from 'react'
import createBadgeColumns from './Columns'
import { CreateBadgeForm } from './CreateBadgeForm'
import { EditBadgeForm } from './EditBadgeForm'
import { useDeleteBadge, useBadges } from './badge.queries'
import BadgeTableToolbar from './BadgeTableToolbar'

type ModalMode = 'create' | 'edit' | 'delete' | null

const BadgeManagement = () => {
  const [modalState, setModalState] = useState<{ mode: ModalMode; data?: Badge }>({
    mode: null,
  })
  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    limit: 10,
  })

  const badgesQuery = useBadges(params)

  const deleteMutation = useDeleteBadge()

  const columns = createBadgeColumns({
    onEdit: (badge) => setModalState({ mode: 'edit', data: badge }),
    onDelete: (badge) => setModalState({ mode: 'delete', data: badge }),
  })

  return (
    <>
      <DataTable
        columns={columns}
        query={badgesQuery}
        onParamsChange={setParams}
        searchPlaceholder="Search by name or code..."
        renderToolbar={() => (
          <BadgeTableToolbar
            onCreate={() => setModalState({ mode: 'create' })}
          />
        )}
      />

      {modalState.mode === 'create' && (
        <CreateBadgeForm open onClose={() => setModalState({ mode: null })} />
      )}

      {modalState.mode === 'edit' && modalState.data && (
        <EditBadgeForm
          open
          badgeId={modalState.data.id}
          onClose={() => setModalState({ mode: null })}
        />
      )}

      {/* Delete Confirmation */}
      {modalState.mode === 'delete' && modalState.data && (
        <ConfirmDialog
          open
          onClose={() => setModalState({ mode: null })}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(modalState.data!.id)
            setModalState({ mode: null })
          }}
          title="Delete Badge Permanently"
          description={`Are you sure you want to permanently delete "${modalState.data.name}"? This action cannot be undone.`}
          confirmText="Delete Permanently"
          variant="destructive"
          isLoading={deleteMutation.isPending}
        />
      )}
    </>
  )
}

export default BadgeManagement
