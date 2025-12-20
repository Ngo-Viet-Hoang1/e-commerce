import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { type Column } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from 'lucide-react'
import { TableCellAlign } from './TableCellWrapper'

type Align = 'left' | 'center' | 'right'

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
  align?: Align
  hideIcon?: boolean
  disableHide?: boolean
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  align = 'left',
  hideIcon = false,
  disableHide = false,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const canSort = column.getCanSort()
  const sorted = column.getIsSorted()

  if (!canSort) {
    return (
      <TableCellAlign align={align} className={className}>
        {title}
      </TableCellAlign>
    )
  }

  return (
    <TableCellAlign align={align} className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'data-[state=open]:bg-accent h-8',
              align === 'left' && '-ml-3',
              align === 'center' && '-mx-3',
              align === 'right' && '-mr-3',
            )}
          >
            <span className="text-sm font-medium">{title}</span>
            {!hideIcon && (
              <>
                {sorted === 'desc' ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
                ) : sorted === 'asc' ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronsUpDown className="ml-2 h-4 w-4" />
                )}
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align === 'right' ? 'end' : 'start'}>
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp className="mr-2 h-4 w-4" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown className="mr-2 h-4 w-4" />
            Desc
          </DropdownMenuItem>
          {!disableHide && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCellAlign>
  )
}
