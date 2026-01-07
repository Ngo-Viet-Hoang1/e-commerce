import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'
import type { Order } from '@/interfaces/order.interface'
import { formatCurrency, formatDate } from '@/lib/format'
import {
  getOrderStatusColor,
  getOrderStatusLabel,
} from '@/constants/order.constants'

interface OrderItemsProps {
  order: Order
  onViewDetail?: (order: Order) => void
  onCancelOrder?: (orderId: number) => void
}

const OrderItems = ({
  order,
  onViewDetail,
  onCancelOrder,
}: OrderItemsProps) => {
  const canCancel = ['pending', 'processing'].includes(order.status)

  const calculatedTotal =
    order.orderItems?.reduce((sum, item) => sum + Number(item.totalPrice), 0) ??
    0

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <CardTitle className="text-lg">Đơn hàng số {order.orderId}</CardTitle>
          <Badge
            variant="secondary"
            className={getOrderStatusColor(order.status)}
          >
            {getOrderStatusLabel(order.status)}
          </Badge>
        </div>
        <div className="text-muted-foreground text-sm">
          {formatDate(order.createdAt)}
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản Phẩm</TableHead>
              <TableHead className="text-end">Số lượng</TableHead>
              <TableHead className="text-end">Đơn giá</TableHead>
              <TableHead className="text-end">Tổng</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {order.orderItems?.map((item) => {
              const image =
                item.variant?.productImages?.[0] ??
                item.product?.productImages?.[0]
              const productName =
                item.product?.name ?? `Product #${item.productId}`

              return (
                <TableRow key={item.id}>
                  <TableCell className="flex items-center gap-3">
                    {image ? (
                      <img
                        src={image.url}
                        alt={image.altText ?? productName}
                        className="size-16 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex size-16 items-center justify-center rounded-md bg-gray-100 text-gray-400">
                        <Package className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{productName}</p>
                      {item.variant?.title && (
                        <p className="text-muted-foreground text-sm">
                          {item.variant.title}
                        </p>
                      )}
                      {(item.variant?.sku ?? item.product?.sku) && (
                        <p className="text-muted-foreground text-xs">
                          {item.variant?.sku ?? item.product?.sku}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-end">{item.quantity}</TableCell>
                  <TableCell className="text-end">
                    {formatCurrency(item.unitPrice, order.currency ?? 'VND')}
                  </TableCell>
                  <TableCell className="text-end">
                    {formatCurrency(item.totalPrice, order.currency ?? 'VND')}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>

          <TableFooter>
            <TableRow className="font-semibold">
              <TableCell colSpan={3}>Tổng</TableCell>
              <TableCell className="text-end">
                {formatCurrency(calculatedTotal, order.currency ?? 'VND')}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>

      <CardFooter className="flex gap-4">
        <Button variant="outline" onClick={() => onViewDetail?.(order)}>
          Chi tiết đơn hàng
        </Button>
        {canCancel && (
          <Button
            variant="outline"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => onCancelOrder?.(order.orderId)}
          >
            Hủy đơn hàng
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export default OrderItems
