import rowSelectionColumn from '@/components/common/table/RowSelectionColumn'
import TableActions from '@/components/common/table/TableActions'
import { TableCellAlign } from '@/components/common/table/TableCellWrapper'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/interfaces/product.interface'
import { formatCurrency } from '@/lib/format'
import type { ColumnDef } from '@tanstack/react-table'
import { ImageIcon } from 'lucide-react'

interface CreateProductColumnsProps {
  onView: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

const statusStyles = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  draft: 'bg-yellow-100 text-yellow-700',
  out_of_stock: 'bg-red-100 text-red-700',
} as const

export default function createProductColumns({
  onView,
  onEdit,
  onDelete,
}: CreateProductColumnsProps): ColumnDef<Product>[] {
  return [
    rowSelectionColumn<Product>(),

    {
      accessorKey: 'stock',
      header: () => <TableCellAlign align="center">Stock</TableCellAlign>,
      cell: ({ row }) => {
        const variants = row.original.variants ?? []
        const totalStock = variants.reduce(
          (sum, v) => sum + (v.stockQuantity || 0),
          0,
        )

        let colorClass = 'text-green-600 bg-green-50'
        let icon = '✓'

        if (totalStock === 0) {
          colorClass = 'text-red-600 bg-red-50'
          icon = '✗'
        } else if (totalStock < 20) {
          colorClass = 'text-yellow-600 bg-yellow-50'
          icon = '⚠'
        }

        return (
          <div
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium ${colorClass}`}
          >
            <span>{icon}</span>
            <span>{totalStock}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'name',
      header: 'Product Name',
      cell: ({ row }) => {
        const isFeatured = row.original.isFeatured
        const images = row.original.productImages ?? []
        const firstImage = images[0]

        return (
          <div className="flex items-center gap-2">
            {firstImage ? (
              <img
                src={firstImage.url}
                alt={firstImage.altText ?? 'Product Image'}
                className="h-16 w-16 rounded-md border object-cover text-xs font-medium"
              />
            ) : (
              <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-md border text-xs font-medium">
                <ImageIcon className="text-muted-foreground h-6 w-6" />
              </div>
            )}
            <div className="max-w-[200px] truncate font-medium">
              {row.getValue('name')}
            </div>
            {isFeatured && <span className="text-yellow-500">⭐</span>}
          </div>
        )
      },
    },
    {
      accessorKey: 'price',
      header: 'Price Range',
      cell: ({ row }) => {
        const variants = row.original.variants ?? []
        if (variants.length === 0) return <div>-</div>

        const prices = variants
          .filter((v) => v.price != null)
          .map((v) => v.price)

        if (prices.length === 0) return <div>-</div>
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)

        if (minPrice === maxPrice) {
          return <div className="font-medium">{formatCurrency(minPrice)}</div>
        }

        return (
          <div className="flex flex-col items-center text-sm leading-tight font-semibold tabular-nums">
            <span>{formatCurrency(minPrice)}</span>
            <span className="text-muted-foreground text-xs">–</span>
            <span>{formatCurrency(maxPrice)}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('sku')}</div>
      ),
    },
    {
      accessorKey: 'brand',
      header: 'Brand',
      cell: ({ row }) => {
        const brand = row.original.brand
        return <div>{brand?.name ?? '-'}</div>
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.original.category
        return <div>{category?.name ?? '-'}</div>
      },
    },
    {
      accessorKey: 'variants',
      header: 'Variants',
      cell: ({ row }) => {
        const variants = row.original.variants ?? []
        return <div className="text-center">{variants.length}</div>
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge
            variant="outline"
            className={`${statusStyles[status as keyof typeof statusStyles]} min-h-7 justify-center`}
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'))
        return (
          <div className="text-muted-foreground text-sm">
            {date.toLocaleDateString('vi-VN')}
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const product = row.original

        return (
          <TableActions
            onView={() => onView(product)}
            onEdit={() => onEdit(product)}
            onDelete={() => onDelete(product)}
          />
        )
      },
    },
  ]
}
