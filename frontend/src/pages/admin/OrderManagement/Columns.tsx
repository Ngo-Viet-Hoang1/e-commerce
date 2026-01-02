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
import type { OrderStatus, PaymentStatus } from '@/constants/order.constants'
import type { Order } from '@/interfaces/order.interface'
import { OrderStatusDropdown, PaymentStatusDropdown } from './StatusDropdown'

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
        <DataTableColumnHeader column={column} title="Order ID" />
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
      header: 'Customer',
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
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const order = row.original
        const status = row.getValue<string>('status') || 'pending'
        return (
          <TableIconCell>
            <OrderStatusDropdown
              currentStatus={status}
              onStatusChange={(newStatus) =>
                onStatusChange?.(order.orderId, newStatus)
              }
              disabled={!onStatusChange}
            />
          </TableIconCell>
        )
      },
    },

    {
      id: 'paymentStatus',
      accessorKey: 'paymentStatus',
      header: 'Payment',
      cell: ({ row }) => {
        const order = row.original
        const paymentStatus =
          row.getValue<string | null>('paymentStatus') ?? 'pending'
        return (
          <TableIconCell>
            <PaymentStatusDropdown
              currentStatus={paymentStatus}
              onStatusChange={(newStatus) =>
                onPaymentStatusChange?.(order.orderId, newStatus)
              }
              disabled={!onPaymentStatusChange}
            />
          </TableIconCell>
        )
      },
    },

    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Amount" />
      ),
      cell: ({ row }) => {
        const amount = row.getValue<number>('totalAmount')
        return (
          <TableTextCell>
            <span>{formatCurrency(amount)}</span>
          </TableTextCell>
        )
      },
    },

    {
      accessorKey: 'shippingMethod',
      header: 'Shipping',
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
        <DataTableColumnHeader column={column} title="Placed At" />
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
      header: 'Delivered At',
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
      header: () => <TableCellAlign align="right">Actions</TableCellAlign>,
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
                Copy Order ID
              </DropdownMenuItem>
            }
          />
        )
      },
    },
  ]
}

export default createOrderColumns
