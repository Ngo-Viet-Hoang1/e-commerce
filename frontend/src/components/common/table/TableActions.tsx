import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { TableCellAlign } from './TableCellWrapper'

interface TableActionsProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  extraActions?: React.ReactNode
}

const TableActions = ({
  onView,
  onEdit,
  onDelete,
  extraActions,
}: TableActionsProps) => {
  return (
    <TableCellAlign align="right" className="gap-1">
      {onView && (
        <Button variant="ghost" size="icon" onClick={onView}>
          <Eye className="h-4 w-4" />
        </Button>
      )}

      {onEdit && (
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
      )}

      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      {extraActions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">{extraActions}</DropdownMenuContent>
        </DropdownMenu>
      )}
    </TableCellAlign>
  )
}

export default TableActions
