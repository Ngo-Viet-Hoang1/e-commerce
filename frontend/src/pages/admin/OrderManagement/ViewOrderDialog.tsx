import { OrderDetail } from '@/components/common/OrderDetail'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { Order } from '@/interfaces/order.interface'
import AdminOrderService from '@/api/services/admin/order.admin.service'
import { downloadBlob, generateOrderPDFFilename } from '@/utils/download'
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
