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
import type { Category } from '@/interfaces/category.interface'

interface CreateCategoryColumnsProps {
  onView?: (category: Category) => void
  onEdit?: (category: Category) => void
  onDelete?: (category: Category) => void
}

const createCategoryColumns = ({
  onView,
  onEdit,
  onDelete,
}: CreateCategoryColumnsProps): ColumnDef<Category>[] => {
  return [
    rowSelectionColumn<Category>(),

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
      accessorKey: 'slug',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Slug" />
      ),
      cell: ({ row }) => {
        const value = row.getValue<string | null>('slug')
        return <TableTextCell muted={!value}>{value ?? '—'}</TableTextCell>
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
        const category = row.original

        return (
          <TableActions
            onView={onView ? () => onView(category) : undefined}
            onEdit={onEdit ? () => onEdit(category) : undefined}
            onDelete={onDelete ? () => onDelete(category) : undefined}
            extraActions={
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(String(category.id))}
                >
                  Copy category ID
                </DropdownMenuItem>
              </>
            }
          />
        )
      },
    },
  ]
}

export default createCategoryColumns