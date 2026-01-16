import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ProductPriceProps {
  minPrice: number
  maxPrice?: number
  minSalePrice?: number
  className?: string
  showSavePercentage?: boolean
}

const ProductPrice: React.FC<ProductPriceProps> = ({
  minPrice,
  maxPrice,
  minSalePrice,
  className,
  showSavePercentage = true,
}) => {
  const hasRange = maxPrice !== undefined && maxPrice > minPrice
  const hasSale = minSalePrice !== undefined && minSalePrice < minPrice

  const basePrice = maxPrice ?? minPrice
  const salePrice = minSalePrice

  const savePercentage = hasSale
    ? Math.round(((basePrice - salePrice!) / basePrice) * 100)
    : null

  if (hasSale) {
    return (
      <div className={cn('space-y-1', className)}>
        <div className="flex items-start justify-between">
          <span className="text-xl leading-none font-semibold">
            {formatCurrency(salePrice)}
          </span>

          {showSavePercentage && savePercentage !== null && (
            <span
              className={cn(
                'ml-3 rounded-sm bg-emerald-500 px-2 py-1',
                'text-sm font-medium text-white',
                'shrink-0',
              )}
            >
              -{savePercentage}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500 line-through">
            {formatCurrency(basePrice)}
          </span>
        </div>
      </div>
    )
  }

  if (hasRange) {
    return (
      <div className={cn('space-y-0.5', className)}>
        <div className="text-xl leading-none font-semibold">
          {formatCurrency(minPrice)}
        </div>
        <div className="text-sm text-gray-500">
          to {formatCurrency(maxPrice)}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('text-xl font-semibold', className)}>
      {formatCurrency(minPrice)}
    </div>
  )
}

export default ProductPrice
