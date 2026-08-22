import { OrderDetail } from '@/entities/order/ui/OrderDetail'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent } from '@/shared/ui/dialog'
import type { Order } from '@/entities/order'
import { AdminOrderService } from '@/entities/order'
import { downloadBlob, generateOrderPDFFilename } from '@/shared/utils/download'
import { toast } from 'sonner'

interface ViewOrderDialogProps {
  open: boolean
  order: Order
  onClose: () => void
}

export function ViewOrderDialog({
  open,
  order,
  onClose,
}: ViewOrderDialogProps) {
  const handleExportPDF = async (orderId: number) => {
    try {
      const blob = await AdminOrderService.exportOrderPDF(orderId)
      const filename = generateOrderPDFFilename(orderId)
      downloadBlob(blob, filename)
      toast.success('Xuất PDF thành công!')
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Xuất PDF thất bại. Vui lòng thử lại!'
      toast.error(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <OrderDetail
          order={order}
          showCustomerEmail
          onExportPDF={handleExportPDF}
        />

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
