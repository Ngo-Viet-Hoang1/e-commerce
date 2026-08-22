import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { DataTable } from '@/shared/ui/table/DataTable'
import {
  createModalState,
  isDeleteMode,
  isViewMode,
  type ModalState,
} from '@/shared/types'
import type { PaginationParams } from '@/shared/types'
import type { Product } from '@/entities/product'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import createProductColumns from './Columns'
import { useDeleteProduct, useProducts, ViewProductDialog } from '@/features/manage-product'

const ProductManagement = () => {
  const navigate = useNavigate()
  const [modalState, setModalState] = useState<ModalState<Product>>(null)
  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    limit: 10,
  })

  const productsQuery = useProducts(params)
  const deleteMutation = useDeleteProduct()

  const columns = useMemo(
    () =>
      createProductColumns({
        onView: (product) => setModalState(createModalState.view(product)),
        onEdit: (product) => navigate(`/admin/products/edit/${product.id}`),
        onDelete: (product) => setModalState(createModalState.delete(product)),
      }),
    [navigate],
  )

  return (
    <>
      <DataTable
        columns={columns}
        query={productsQuery}
        onParamsChange={setParams}
        searchPlaceholder="Search by SKU or name..."
      />

      {/* View Product Dialog */}
      {isViewMode(modalState) && (
        <ViewProductDialog
          open
          product={modalState.data}
          onClose={() => setModalState(null)}
          onEdit={() => {
            navigate(`/admin/products/edit/${modalState.data.id}`)
            setModalState(null)
          }}
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
          title="Delete Product"
          description={`Are you sure you want to delete "${modalState.data.name}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="destructive"
          isLoading={deleteMutation.isPending}
        />
      )}
    </>
  )
}

export default ProductManagement
