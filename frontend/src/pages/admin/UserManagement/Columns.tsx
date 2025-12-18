/* eslint-disable @typescript-eslint/no-empty-function */
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatDate, formatDateTime } from '@/lib/format'
import type { ColumnDef } from '@tanstack/react-table'
import { Check, Lock, LockOpen, ShieldCheck, X } from 'lucide-react'

import { DataTableColumnHeader } from '@/components/common/table/DataTableColumnHeader'
import rowSelectionColumn from '@/components/common/table/RowSelectionColumn'
import { StatusBadge } from '@/components/common/table/StatusBadge'
import TableActions from '@/components/common/table/TableActions'
import {
  TableCellAlign,
  TableIconCell,
  TableTextCell,
} from '@/components/common/table/TableCellWrapper'
import type { User } from '@/interfaces/user.interface'

interface CreateUserColumnsProps {
  onView?: (user: User) => void
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
}

const createUserColumns = ({
  onView,
  onEdit,
  onDelete,
}: CreateUserColumnsProps): ColumnDef<User>[] => {
  return [
    rowSelectionColumn<User>(),

    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => {
        const email = row.getValue<string>('email')
        return (
          <TableTextCell>
            <a href={`mailto:${email}`} className="font-medium hover:underline">
              {email}
            </a>
          </TableTextCell>
        )
      },
    },

    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const value = row.getValue<string | null>('name')
        return <TableTextCell muted={!value}>{value ?? '—'}</TableTextCell>
      },
    },

    {
      accessorKey: 'googleId',
      header: () => <TableCellAlign align="center">Auth</TableCellAlign>,
      cell: ({ row }) => {
        const value = row.getValue<string | null>('googleId')

        return (
          <TableIconCell>
            {value ? (
              <Badge variant="secondary">Google</Badge>
            ) : (
              <Badge variant="outline">Password</Badge>
            )}
          </TableIconCell>
        )
      },
    },

    {
      id: 'security',
      header: () => (
        <div className="flex items-center justify-center gap-1">
          <ShieldCheck className="h-4 w-4" />
          Security
        </div>
      ),
      cell: ({ row }) => {
        const { emailVerified, isMfaActive } = row.original

        return (
          <TableCellAlign align="center" className="gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  {emailVerified ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="text-muted-foreground h-4 w-4" />
                  )}
                </TooltipTrigger>
                <TooltipContent>Email verified</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger>
                  {isMfaActive ? (
                    <Lock className="h-4 w-4 text-green-600" />
                  ) : (
                    <LockOpen className="text-muted-foreground h-4 w-4" />
                  )}
                </TooltipTrigger>
                <TooltipContent>MFA</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableCellAlign>
        )
      },
    },

    {
      accessorKey: 'lastLoginAt',
      header: 'Last login',
      cell: ({ row }) => {
        const value = row.getValue<Date | null>('lastLoginAt')
        const inactive = !value

        return (
          <TableTextCell small muted={inactive}>
            {formatDateTime(value)}
          </TableTextCell>
        )
      },
    },

    {
      id: 'status',
      header: () => <TableCellAlign align="center">Status</TableCellAlign>,
      cell: ({ row }) => {
        const { deletedAt, isActive } = row.original

        if (deletedAt) {
          return <Badge variant="destructive">Deleted</Badge>
        }

        return (
          <TableIconCell>
            <StatusBadge status={isActive ? 'active' : 'inactive'} />
          </TableIconCell>
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
        const user = row.original

        return (
          <TableActions
            onView={onView ? () => onView(user) : undefined}
            onEdit={onEdit ? () => onEdit(user) : undefined}
            onDelete={onDelete ? () => onDelete(user) : undefined}
            extraActions={
              <>
                <DropdownMenuItem>Reset password</DropdownMenuItem>
                <DropdownMenuItem>Force logout</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(String(user.id))}
                >
                  Copy user ID
                </DropdownMenuItem>
              </>
            }
          />
        )
      },
    },
  ]
}

export default createUserColumns
