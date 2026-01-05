import { DataTable } from '@/components/common/table/DataTable'
import {
  createModalState,
  isEditMode,
  type ModalState,
} from '@/interfaces/modal.interface'
import type { Order } from '@/interfaces/order.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { useState } from 'react'
import createOrderColumns from './Columns'
import { useOrders } from './order.queries'
import OrderTableToolbar from './OrderTableToolbar'
import { UpdateOrderStatusForm } from './UpdateOrderStatusForm'

const OrderManagement = () => {
  const [modalState, setModalState] = useState<ModalState<Order>>(null)
  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    limit: 10,
  })

  const ordersQuery = useOrders(params)

  const columns = createOrderColumns({
    onUpdateStatus: (order) => setModalState(createModalState.edit(order)),
  })

  return (
    <>
      <DataTable
        columns={columns}
        query={ordersQuery}
        onParamsChange={setParams}
        searchPlaceholder="Search by order ID or customer..."
        renderToolbar={() => <OrderTableToolbar />}
      />

      {isEditMode(modalState) && (
        <UpdateOrderStatusForm
          open
          orderId={modalState.data.orderId}
          onClose={() => setModalState(null)}
        />
      )}
    </>
  )
}

export default OrderManagement
