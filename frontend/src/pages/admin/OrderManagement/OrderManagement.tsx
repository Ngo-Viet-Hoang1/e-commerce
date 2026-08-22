import { DataTable } from '@/shared/ui/table/DataTable'
import type { OrderStatus, PaymentStatus } from '@/entities/order'
import {
  createModalState,
  isViewMode,
  type ModalState,
} from '@/shared/types'
import type { Order } from '@/entities/order'
import type { PaginationParams } from '@/shared/types'
import { useState } from 'react'
import createOrderColumns from './Columns'
import { useOrders, useUpdateOrderStatus, ViewOrderDialog } from '@/features/manage-order'

const OrderManagement = () => {
  const [modalState, setModalState] = useState<ModalState<Order>>(null)
  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    limit: 10,
  })

  const ordersQuery = useOrders(params)
  const updateStatus = useUpdateOrderStatus()

  const handleStatusChange = (orderId: number, status: OrderStatus) => {
    updateStatus.mutate({ id: orderId, status })
  }

  const handlePaymentStatusChange = (
    orderId: number,
    paymentStatus: PaymentStatus,
  ) => {
    updateStatus.mutate({ id: orderId, paymentStatus })
  }

  const columns = createOrderColumns({
    onView: (order) => setModalState(createModalState.view(order)),
    onStatusChange: handleStatusChange,
    onPaymentStatusChange: handlePaymentStatusChange,
  })

  return (
    <>
      <DataTable
        columns={columns}
        query={ordersQuery}
        onParamsChange={setParams}
        searchPlaceholder="Tìm kiếm đơn hàng..."
      />

      {isViewMode(modalState) && (
        <ViewOrderDialog
          open
          order={modalState.data}
          onClose={() => setModalState(null)}
        />
      )}
    </>
  )
}

export default OrderManagement
