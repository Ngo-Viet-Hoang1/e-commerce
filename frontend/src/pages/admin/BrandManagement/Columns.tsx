import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/format'
import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/components/common/table/DataTableColumnHeader'
import rowSelectionColumn from '@/components/common/table/RowSelectionColumn'
import TableActions from '@/components/common/table/TableActions'
import {
  TableCellAlign,
  TableTextCell,
} from '@/components/common/table/TableCellWrapper'
import type { Brand } from '@/interfaces/brand.interface'

interface CreateBrandColumnsProps {
  onView?: (brand: Brand) => void
  onEdit?: (brand: Brand) => void
  onDelete?: (brand: Brand) => void
}

const createBrandColumns = ({
  onView,
  onEdit,
  onDelete,
}: CreateBrandColumnsProps): ColumnDef<Brand>[] => {
  return [
    rowSelectionColumn<Brand>(),

    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const name = row.getValue<string>('name')
        return (
          <TableTextCell>
            <span className="font-medium">{name}</span>
          </TableTextCell>
        )
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
      accessorKey: 'logoUrl',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Logo URL" />
      ),
      cell: ({ row }) => {
        const value = row.getValue<string | null>('logoUrl')
        return (
          <TableTextCell muted={!value}>
            {value ? (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {value}
              </a>
            ) : (
              '—'
            )}
          </TableTextCell>
        )
      },
    },

    {
      accessorKey: 'website',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Website" />
      ),
      cell: ({ row }) => {
        const value = row.getValue<string | null>('website')
        return (
          <TableTextCell muted={!value}>
            {value ? (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {value}
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
        const brand = row.original

        return (
          <TableActions
            onView={onView ? () => onView(brand) : undefined}
            onEdit={onEdit ? () => onEdit(brand) : undefined}
            onDelete={onDelete ? () => onDelete(brand) : undefined}
            extraActions={
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(String(brand.id))}
                >
                  Copy brand ID
                </DropdownMenuItem>
              </>
            }
          />
        )
      },
    },
  ]
}

export default createBrandColumns
