import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/format'
import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/components/common/table/DataTableColumnHeader'
import rowSelectionColumn from '@/components/common/table/RowSelectionColumn'
import {
  TableCellAlign,
  TableTextCell,
} from '@/components/common/table/TableCellWrapper'
import type { Badge } from '@/interfaces/badge.interface'

interface CreateBadgeColumnsProps {
  onEdit?: (badge: Badge) => void
  onDelete?: (badge: Badge) => void
}

const createBadgeColumns = ({
  onEdit,
  onDelete,
}: CreateBadgeColumnsProps): ColumnDef<Badge>[] => {
  return [
    rowSelectionColumn<Badge>(),

    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => {
        const code = row.getValue<string>('code')
        return (
          <TableTextCell>
            <span className="font-medium">{code}</span>
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
        const name = row.getValue<string>('name')
        return <TableTextCell>{name}</TableTextCell>
      },
    },

    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        const value = row.getValue<string | null>('description')
        return <TableTextCell muted={!value}>{value ?? '—'}</TableTextCell>
      },
    },

    {
      accessorKey: 'iconUrl',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Icon URL" />
      ),
      cell: ({ row }) => {
        const value = row.getValue<string | null>('iconUrl')
        return (
          <TableTextCell muted={!value}>
            {value ? (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                View Icon
              </a>
            ) : (
              '—'
            )}
          </TableTextCell>
        )
      },
    },

    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const date = row.getValue<Date>('createdAt')
        return <TableTextCell>{formatDate(date)}</TableTextCell>
      },
    },

    {
      id: 'actions',
      header: () => <TableCellAlign align="right"> Actions </TableCellAlign>,
      cell: ({ row }) => {
        const badge = row.original
        const isDeleted = badge.deletedAt !== null

        if (isDeleted) {
          return null
        }

        return (
          <TableCellAlign align="right" className="gap-1">
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={() => onEdit(badge)}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(badge)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </TableCellAlign>
        )
      },
    },
  ]
}

export default createBadgeColumns
