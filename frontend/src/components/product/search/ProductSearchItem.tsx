import type { Product } from '@/interfaces/product.interface'
import { ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/format'

interface Props {
  product: Product
  onSelect: (product: Product) => void
}

export default function ProductSearchItem({ product, onSelect }: Props) {
  const image = product.productImages?.find((img) => img.isPrimary)?.url ?? ''

  const defaultVariant = product.variants?.find((variant) => variant.isDefault)

  const price = defaultVariant?.price
  const oldPrice = defaultVariant?.msrp

  return (
    <li
      onClick={() => onSelect(product)}
      className="group hover:bg-muted/60 hover:ring-border flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:shadow-sm hover:ring-1"
    >
      <div className="bg-muted h-11 w-11 shrink-0 overflow-hidden rounded-lg">
        {image && (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <p className="truncate text-sm font-semibold">{product.name}</p>

        {price && (
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-sm font-bold text-red-600">
              {formatCurrency(price)}
            </span>

            {oldPrice && (
              <span className="text-muted-foreground text-xs line-through">
                {formatCurrency(oldPrice)}
              </span>
            )}
          </div>
        )}
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-60" />
    </li>
  )
}
