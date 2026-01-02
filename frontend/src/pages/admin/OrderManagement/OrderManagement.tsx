import { DataTable } from '@/components/common/table/DataTable'
import type { OrderStatus, PaymentStatus } from '@/constants/order.constants'
import {
  createModalState,
  isViewMode,
  type ModalState,
} from '@/interfaces/modal.interface'
import type { Order } from '@/interfaces/order.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { useState } from 'react'
import createOrderColumns from './Columns'
import { useOrders, useUpdateOrderStatus } from './order.queries'
import { ViewOrderDialog } from './ViewOrderDialog'

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
        searchPlaceholder="Search by order ID, email, or name..."
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
