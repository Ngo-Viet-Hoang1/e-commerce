import { OrderDetail } from '@/components/common/OrderDetail'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { Order } from '@/interfaces/order.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { useState } from 'react'
import { useCancelUserOrder, useUserOrders } from './order.queries'
import OrderItems from './OrderItems'
import { Package } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

const OrdersPage = () => {
  const [params] = useState<PaginationParams>({
    page: 1,
    limit: 10,
  })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null)

  const { data, isLoading, isError } = useUserOrders(params)
  const cancelOrder = useCancelUserOrder()

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order)
  }

  const handleCancelOrder = (orderId: number) => {
    setCancelOrderId(orderId)
  }

  const confirmCancelOrder = () => {
    if (cancelOrderId) {
      cancelOrder.mutate(cancelOrderId, {
        onSuccess: () => {
          setCancelOrderId(null)
        },
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">Tải đơn hàng thất bại</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Thử lại
        </Button>
      </div>
    )
  }

  const orders = data?.data ?? []
  const meta = data?.meta

  if (orders.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-muted-foreground">
          <Package className="mx-auto mb-4 h-16 w-16" />
          <p className="text-lg font-medium">Chưa có đơn hàng nào</p>
          <p className="text-sm">Khi bạn đặt hàng, nó sẽ xuất hiện ở đây.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
        <p className="text-muted-foreground">
          Tổng đơn hàng: {meta?.total ?? orders.length}
        </p>
      </div>

      <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-2">
        {orders.map((order) => (
          <OrderItems
            key={order.orderId}
            order={order}
            onViewDetail={handleViewDetail}
            onCancelOrder={handleCancelOrder}
          />
        ))}
      </div>

      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
          </DialogHeader>
          {selectedOrder && <OrderDetail order={selectedOrder} />}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!cancelOrderId}
        onClose={() => setCancelOrderId(null)}
        onConfirm={confirmCancelOrder}
        title="Xác nhận hủy đơn hàng"
        description={`Bạn có chắc chắn muốn hủy đơn hàng #${cancelOrderId}? Hành động này không thể hoàn tác.`}
        confirmText="Hủy đơn hàng"
        cancelText="Đóng"
        variant="destructive"
        isLoading={cancelOrder.isPending}
      />
    </div>
  )
}

export default OrdersPage
