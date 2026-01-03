import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { formatCurrency, formatDate } from '@/lib/format'
import type { ColumnDef } from '@tanstack/react-table'
import { Package } from 'lucide-react'

import { DataTableColumnHeader } from '@/components/common/table/DataTableColumnHeader'
import rowSelectionColumn from '@/components/common/table/RowSelectionColumn'
import TableActions from '@/components/common/table/TableActions'
import {
  TableCellAlign,
  TableIconCell,
  TableTextCell,
} from '@/components/common/table/TableCellWrapper'
import {
  StatusDropdown,
  type StatusOption,
} from '@/components/common/StatusDropdown'
import {
  getAvailableOrderStatuses,
  getAvailablePaymentStatuses,
  getOrderStatusColor,
  getOrderStatusLabel,
  getPaymentStatusColor,
  getPaymentStatusLabel,
  type OrderStatus,
  type PaymentStatus,
} from '@/constants/order.constants'
import type { Order } from '@/interfaces/order.interface'

interface CreateOrderColumnsProps {
  onView?: (order: Order) => void
  onStatusChange?: (orderId: number, status: OrderStatus) => void
  onPaymentStatusChange?: (
    orderId: number,
    paymentStatus: PaymentStatus,
  ) => void
}

const createOrderColumns = ({
  onView,
  onStatusChange,
  onPaymentStatusChange,
}: CreateOrderColumnsProps): ColumnDef<Order>[] => {
  return [
    rowSelectionColumn<Order>(),

    {
      accessorKey: 'orderId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mã đơn hàng" />
      ),
      cell: ({ row }) => {
        const orderId = row.getValue<number>('orderId')
        return (
          <TableTextCell>
            <div className="flex items-center gap-2">
              <Package className="text-muted-foreground h-4 w-4" />
              <span className="font-medium">#{orderId}</span>
            </div>
          </TableTextCell>
        )
      },
    },

    {
      id: 'customer',
      header: 'Khách hàng',
      cell: ({ row }) => {
        const recipientName = row.original.shippingRecipientName
        return (
          <TableTextCell muted={!recipientName}>
            {recipientName ?? '—'}
          </TableTextCell>
        )
      },
    },

    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trạng thái" />
      ),
      cell: ({ row }) => {
        const order = row.original
        const status = row.getValue<string>('status') || 'pending'
        const options = getAvailableOrderStatuses(
          status,
        ) as StatusOption<OrderStatus>[]
        const isCancelled = status.toLowerCase() === 'cancelled'

        return (
          <TableIconCell>
            <StatusDropdown<OrderStatus>
              currentStatus={status.toLowerCase() as OrderStatus}
              options={options}
              onStatusChange={(newStatus) =>
                onStatusChange?.(order.orderId, newStatus)
              }
              getStatusColor={getOrderStatusColor}
              getStatusLabel={getOrderStatusLabel}
              disabled={!onStatusChange || isCancelled}
            />
          </TableIconCell>
        )
      },
    },

    {
      id: 'paymentStatus',
      accessorKey: 'paymentStatus',
      header: 'Thanh toán',
      cell: ({ row }) => {
        const order = row.original
        const status = order.status?.toLowerCase() ?? ''
        const paymentStatus =
          row.getValue<string | null>('paymentStatus') ?? 'pending'
        const options = getAvailablePaymentStatuses(
          paymentStatus,
        ) as StatusOption<PaymentStatus>[]
        const isCancelled = status === 'cancelled'

        return (
          <TableIconCell>
            <StatusDropdown<PaymentStatus>
              currentStatus={paymentStatus.toLowerCase() as PaymentStatus}
              options={options}
              onStatusChange={(newStatus) =>
                onPaymentStatusChange?.(order.orderId, newStatus)
              }
              getStatusColor={getPaymentStatusColor}
              getStatusLabel={getPaymentStatusLabel}
              disabled={!onPaymentStatusChange || isCancelled}
            />
          </TableIconCell>
        )
      },
    },

    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tổng tiền" />
      ),
      cell: ({ row }) => {
        const order = row.original
        const subtotal =
          order.orderItems?.reduce(
            (sum, item) => sum + Number(item.totalPrice),
            0,
          ) ?? 0
        const shippingFee = Number(order.shippingFee ?? 0)
        const total = subtotal + shippingFee

        return (
          <TableTextCell>
            <span>{formatCurrency(total)}</span>
          </TableTextCell>
        )
      },
    },

    {
      accessorKey: 'shippingMethod',
      header: 'Giao hàng',
      cell: ({ row }) => {
        const province = row.original.province
        return (
          <TableTextCell small muted={!province}>
            {province ? province.name : '—'}
          </TableTextCell>
        )
      },
    },

    {
      accessorKey: 'placedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày đặt" />
      ),
      cell: ({ row }) => {
        const value = row.getValue<Date | null>('placedAt')
        return (
          <TableTextCell small muted={!value}>
            {formatDate(value)}
          </TableTextCell>
        )
      },
    },

    {
      accessorKey: 'deliveredAt',
      header: 'Ngày giao',
      cell: ({ row }) => {
        const value = row.getValue<Date | null>('deliveredAt')
        return (
          <TableTextCell small muted={!value}>
            {formatDate(value)}
          </TableTextCell>
        )
      },
    },

    {
      id: 'actions',
      header: () => <TableCellAlign align="right">Hành động</TableCellAlign>,
      cell: ({ row }) => {
        const order = row.original

        return (
          <TableActions
            onView={onView ? () => onView(order) : undefined}
            extraActions={
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(String(order.orderId))
                }
              >
                Sao chép mã đơn
              </DropdownMenuItem>
            }
          />
        )
      },
    },
  ]
}

export default createOrderColumns
