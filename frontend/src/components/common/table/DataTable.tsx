import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useDebounce from '@/hooks/useDebounce'
import type { IPaginatedResponse } from '@/interfaces/base-response.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { ApiError } from '@/models/ApiError'
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  type SortingState,
  type Table as TableType,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import { DataTablePagination } from './DataTablePagination'
import { DataTableViewOptions } from './DataTableViewOptions'

interface DataTableProps<
  TData,
  TValue,
  TParams extends PaginationParams = PaginationParams,
> {
  columns: ColumnDef<TData, TValue>[]

  fetchData: (params: TParams) => Promise<IPaginatedResponse<TData>>

  searchPlaceholder?: string
  searchable?: boolean
  defaultPageSize?: number
  renderToolbar?: (table: TableType<TData>) => React.ReactNode
}

export interface DataTableRef<TData = unknown> {
  refetch: () => void
  getSelectedRows: () => TData[]
  clearSelection: () => void
}

function DataTableInner<
  TData,
  TValue,
  TParams extends PaginationParams = PaginationParams,
>(
  {
    columns,
    fetchData,
    searchPlaceholder = 'Search...',
    searchable = true,
    defaultPageSize = 10,
  }: DataTableProps<TData, TValue, TParams>,
  ref: React.Ref<DataTableRef>,
) {
  const [data, setData] = useState<TData[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [pageCount, setPageCount] = useState(0)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })

  const [globalFilter, setGlobalFilter] = useState('')
  const debouncedSearch = useDebounce(globalFilter, 500)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      } as TParams

      if (debouncedSearch) {
        params.search = debouncedSearch
      }

      if (sorting.length > 0) {
        params.sort = sorting[0].id
        params.order = sorting[0].desc ? 'desc' : 'asc'
      }

      if (columnFilters.length > 0) {
        params.filters = columnFilters.reduce<Record<string, unknown>>(
          (acc, filter) => {
            acc[filter.id] = filter.value
            return acc
          },
          {},
        )
      }

      const result = await fetchData(params as TParams)

      setData(result.data ?? [])
      setTotalRows(result.meta.total)
      setPageCount(result.meta.totalPages)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to load data')
      }
    } finally {
      setIsLoading(false)
    }
  }, [fetchData, pagination, sorting, columnFilters, debouncedSearch])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Reset to page 1 when search or filters change
  useEffect(() => {
    if (pagination.pageIndex !== 0) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }
  }, [debouncedSearch, columnFilters, sorting])

  const table = useReactTable({
    data,
    columns,

    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,

    pageCount,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
    },

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,

    getCoreRowModel: getCoreRowModel(),
  })

  useImperativeHandle(
    ref,
    (): DataTableRef<TData> => ({
      refetch: () => loadData(),
      getSelectedRows: () =>
        table.getSelectedRowModel().rows.map((row) => row.original) as TData[],
      clearSelection: () => setRowSelection({}),
    }),
  )

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 py-4">
        {searchable && (
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full shrink-0 sm:w-64 md:w-72"
          />
        )}
        <DataTableViewOptions table={table} />
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pagination.pageSize }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-destructive h-24 text-center"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} totalRows={totalRows} />
    </div>
  )
}

export const DataTable = forwardRef(DataTableInner) as <
  TData,
  TValue,
  TParams extends PaginationParams = PaginationParams,
>(
  props: DataTableProps<TData, TValue, TParams> & {
    ref?: React.Ref<DataTableRef>
  },
) => React.ReactElement
