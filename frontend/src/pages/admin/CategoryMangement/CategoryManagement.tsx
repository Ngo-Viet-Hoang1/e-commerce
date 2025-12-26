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
import type { Category } from '@/interfaces/category.interface'
import { useState } from 'react'
import createCategoryColumns from './Columns'
import { CreateCategoryForm } from './CreateCategoryForm'
import { EditCategoryForm } from './EditCategoryForm'
import { useDeleteCategory, useCategories } from './category.queries'
import CategoryTableToolbar from './CategoryTableToolbar'

const CategoryManagement = () => {
  const [modalState, setModalState] = useState<ModalState<Category>>(null)
  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    limit: 10,
  })

  const categoriesQuery = useCategories(params)

  const deleteMutation = useDeleteCategory()

  const columns = createCategoryColumns({
    onEdit: (category) => setModalState(createModalState.edit(category)),
    onDelete: (category) => setModalState(createModalState.delete(category)),
  })

  return (
    <>
      <DataTable
        columns={columns}
        query={categoriesQuery}
        onParamsChange={setParams}
        searchPlaceholder="Search by name or slug..."
        renderToolbar={() => (
          <CategoryTableToolbar
            onCreate={() => setModalState(createModalState.create())}
          />
        )}
      />

      {isCreateMode(modalState) && (
        <CreateCategoryForm open onClose={() => setModalState(null)} />
      )}

      {isEditMode(modalState) && (
        <EditCategoryForm
          open
          categoryId={modalState.data.id}
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
          title="Delete Category"
          description={`Are you sure you want to delete ${modalState.data.name}?`}
          confirmText="Delete"
          variant="destructive"
          isLoading={deleteMutation.isPending}
        />
      )}
    </>
  )
}

export default CategoryManagement
