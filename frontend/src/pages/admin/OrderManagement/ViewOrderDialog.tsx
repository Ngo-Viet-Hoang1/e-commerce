import { OrderDetail } from '@/components/common/OrderDetail'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { Order } from '@/interfaces/order.interface'

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
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <OrderDetail order={order} showCustomerEmail />

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
