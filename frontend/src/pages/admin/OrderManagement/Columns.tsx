import { Badge } from '@/components/ui/badge'
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { formatDate, formatDateTime } from '@/lib/format'
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
import type { Order } from '@/interfaces/order.interface'

interface CreateOrderColumnsProps {
  onView?: (order: Order) => void
  onUpdateStatus?: (order: Order) => void
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    shipped:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    delivered:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getPaymentStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const createOrderColumns = ({
  onView,
  onUpdateStatus,
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
        const user = row.original.user
        return (
          <TableTextCell muted={!user}>
            {user ? (
              <div>
                <div className="font-medium">{user.name ?? 'N/A'}</div>
                <div className="text-muted-foreground text-xs">
                  {user.email}
                </div>
              </div>
            ) : (
              '—'
            )}
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
        const status = row.getValue<string>('status')
        return (
          <TableIconCell>
            <Badge className={getStatusColor(status)} variant="secondary">
              {status}
            </Badge>
          </TableIconCell>
        )
      },
    },

    {
      id: 'paymentStatus',
      accessorKey: 'paymentStatus',
      header: 'Payment',
      cell: ({ row }) => {
        const paymentStatus = row.getValue<string | null>('paymentStatus')
        return (
          <TableIconCell>
            {paymentStatus ? (
              <Badge
                className={getPaymentStatusColor(paymentStatus)}
                variant="secondary"
              >
                {paymentStatus}
              </Badge>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
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
        const currency = row.original.currency ?? 'USD'
        return (
          <TableTextCell>
            <span className="font-medium">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
              }).format(amount)}
            </span>
          </TableTextCell>
        )
      },
    },

    {
      accessorKey: 'shippingMethod',
      header: 'Shipping',
      cell: ({ row }) => {
        const shippingMethod = row.getValue<string | null>('shippingMethod')
        const shippingFee = row.original.shippingFee
        return (
          <TableTextCell small muted={!shippingMethod}>
            {shippingMethod ? (
              <div>
                <div>{shippingMethod}</div>
                {shippingFee && (
                  <div className="text-muted-foreground text-xs">
                    ${Number(shippingFee).toFixed(2)}
                  </div>
                )}
              </div>
            ) : (
              '—'
            )}
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
            {formatDateTime(value)}
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
            {value ? formatDateTime(value) : '—'}
          </TableTextCell>
        )
      },
    },

    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <TableTextCell muted small>
          {formatDate(row.getValue('createdAt'))}
        </TableTextCell>
      ),
    },

    {
      id: 'actions',
      header: () => <TableCellAlign align="right">Actions</TableCellAlign>,
      cell: ({ row }) => {
        const order = row.original

        return (
          <TableActions
            onView={onView ? () => onView(order) : undefined}
            onEdit={onUpdateStatus ? () => onUpdateStatus(order) : undefined}
            extraActions={
              <>
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Print Invoice</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(String(order.orderId))
                  }
                >
                  Copy Order ID
                </DropdownMenuItem>
              </>
            }
          />
        )
      },
    },
  ]
}

export default createOrderColumns
