import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useOrder, useUpdateOrderStatus } from './order.queries'
import {
  type UpdateOrderStatusInputs,
  updateOrderStatusSchema,
} from './order.schema'

interface UpdateOrderStatusFormProps {
  orderId: number
  open: boolean
  onClose: () => void
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
]

export function UpdateOrderStatusForm({
  orderId,
  open,
  onClose,
}: UpdateOrderStatusFormProps) {
  const orderQuery = useOrder(orderId)
  const updateStatus = useUpdateOrderStatus()

  const form = useForm<UpdateOrderStatusInputs>({
    resolver: zodResolver(updateOrderStatusSchema),
    defaultValues: {
      status: 'pending',
    },
  })

  useEffect(() => {
    if (orderQuery.data?.data) {
      form.reset({
        status: orderQuery.data.data
          .status as UpdateOrderStatusInputs['status'],
      })
    }
  }, [orderQuery.data, form])

  const onSubmit = async (values: UpdateOrderStatusInputs) => {
    await updateStatus.mutateAsync({
      id: orderId,
      status: values.status,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>

        {orderQuery.isLoading ? (
          <div className="text-muted-foreground py-6 text-center text-sm">
            Loading order...
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="bg-muted rounded-md p-3">
                <div className="text-muted-foreground text-sm">Order ID</div>
                <div className="font-medium">#{orderId}</div>
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={updateStatus.isPending}
                  >
                    Cancel
                  </Button>
                </DialogClose>

                <Button type="submit" disabled={updateStatus.isPending}>
                  {updateStatus.isPending ? 'Updating...' : 'Update Status'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
