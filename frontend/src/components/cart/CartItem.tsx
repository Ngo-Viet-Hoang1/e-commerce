import { Button } from '@/components/ui/button'
import type { CartItem as ICartItem } from '@/interfaces/cart.interface'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { AlertTriangle, Minus, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface CartItemProps {
  item: ICartItem
  onUpdateQuantity: (
    productId: number,
    variantId: number,
    quantity: number,
  ) => void
  onRemove: (productId: number, variantId: number) => void
  isUpdating?: boolean
  isRemoving?: boolean
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating,
  isRemoving,
}: CartItemProps) {
  // Use item.quantity directly to ensure sync with server
  const [quantity, setQuantity] = useState(item.quantity)

  const isOutOfStock = item.variant.stockQuantity === 0
  const isLowStock =
    !isOutOfStock &&
    (quantity > item.variant.stockQuantity || item.variant.stockQuantity <= 5)
  const canDecrease = quantity > 1 && !isOutOfStock
  const canIncrease =
    !isOutOfStock && quantity < item.variant.stockQuantity && quantity < 999

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.variant.stockQuantity) return
    setQuantity(newQuantity)
    onUpdateQuantity(item.productId, item.variantId, newQuantity)
  }

  const handleIncrease = () => {
    if (canIncrease) {
      handleQuantityChange(quantity + 1)
    }
  }

  const handleDecrease = () => {
    if (canDecrease) {
      handleQuantityChange(quantity - 1)
    }
  }

  return (
    <div
      className={cn(
        'bg-card flex gap-4 rounded-lg border p-4 transition-opacity',
        (isUpdating ?? isRemoving) && 'pointer-events-none opacity-50',
        isOutOfStock && 'bg-muted/50',
      )}
    >
      {/* Product Image */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md">
        <img
          src={item.product.image ?? '/placeholder.png'}
          alt={item.product.name}
          className="h-full w-full object-cover"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-xs font-semibold text-white">Hết hàng</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div>
            <h3 className="text-foreground font-semibold">
              {item.product.name}
            </h3>
            {item.variant.title && (
              <p className="text-muted-foreground text-sm">
                {item.variant.title}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              SKU: {item.variant.sku}
            </p>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(item.productId, item.variantId)}
            disabled={isRemoving}
            className="text-muted-foreground hover:text-destructive h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Warnings */}
        {isOutOfStock && (
          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-red-600">
            <AlertTriangle className="h-3 w-3" />
            <span>Sản phẩm đã hết hàng</span>
          </div>
        )}

        {isLowStock && (
          <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            {quantity > item.variant.stockQuantity ? (
              <span>
                Vượt quá số lượng có sẵn (Còn {item.variant.stockQuantity})
              </span>
            ) : (
              <span>
                Chỉ còn {item.variant.stockQuantity} sản phẩm trong kho
              </span>
            )}
          </div>
        )}

        {item.priceChanged && (
          <div className="mt-1 flex items-center gap-1 text-xs text-blue-600">
            <AlertTriangle className="h-3 w-3" />
            <span>
              Giá đã thay đổi: {formatCurrency(item.price)} →{' '}
              {formatCurrency(item.currentPrice)}
            </span>
          </div>
        )}

        {/* Price & Quantity */}
        <div className="mt-auto flex items-center justify-between pt-2">
          {/* Quantity Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecrease}
                disabled={!canDecrease || isOutOfStock || isUpdating}
                className="h-8 w-8"
              >
                <Minus className="h-3 w-3" />
              </Button>

              <span className="w-12 text-center font-medium">{quantity}</span>

              <Button
                variant="outline"
                size="icon"
                onClick={handleIncrease}
                disabled={!canIncrease || isOutOfStock || isUpdating}
                className="h-8 w-8"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Stock Info */}
            {!isOutOfStock && (
              <div className="text-muted-foreground text-xs">
                <span className="hidden sm:inline">Có sẵn: </span>
                <span className="font-medium">
                  {item.variant.stockQuantity}
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="text-foreground font-semibold">
              {formatCurrency(item.subtotal)}
            </div>
            <div className="text-muted-foreground text-xs">
              {formatCurrency(item.currentPrice)} / sản phẩm
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
