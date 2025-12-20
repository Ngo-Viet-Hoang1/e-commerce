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
import type { Brand } from '@/interfaces/brand.interface'
import { useState } from 'react'
import createBrandColumns from './Columns'
import { CreateBrandForm } from './CreateBrandForm'
import { EditBrandForm } from './EditBrandForm'
import { useDeleteBrand, useBrands } from './brand.queries'
import BrandTableToolbar from './BrandTableToolbar'

const BrandManagement = () => {
  const [modalState, setModalState] = useState<ModalState<Brand>>(null)
  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    limit: 10,
  })

  const brandsQuery = useBrands(params)

  const deleteMutation = useDeleteBrand()

  const columns = createBrandColumns({
    onEdit: (brand) => setModalState(createModalState.edit(brand)),
    onDelete: (brand) => setModalState(createModalState.delete(brand)),
  })

  return (
    <>
      <DataTable
        columns={columns}
        query={brandsQuery}
        onParamsChange={setParams}
        searchPlaceholder="Search by name..."
        renderToolbar={() => (
          <BrandTableToolbar
            onCreate={() => setModalState(createModalState.create())}
          />
        )}
      />

      {isCreateMode(modalState) && (
        <CreateBrandForm open onClose={() => setModalState(null)} />
      )}

      {isEditMode(modalState) && (
        <EditBrandForm
          open
          brandId={modalState.data.id}
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
          title="Delete Brand"
          description={`Are you sure you want to delete ${modalState.data.name}?`}
          confirmText="Delete"
          variant="destructive"
          isLoading={deleteMutation.isPending}
        />
      )}
    </>
  )
}

export default BrandManagement
