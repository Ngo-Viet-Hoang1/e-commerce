import { Checkbox } from '@/shared/ui/checkbox'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Trash2, Plus, Minus, AlertTriangle } from 'lucide-react'
import type { CartItem as CartItemType } from '../model/types'
import { formatCurrency } from '@/shared/utils/format'

export function SelectAllCheckbox({
  totalCount,
  selectedCount,
  isAllSelected,
  onSelectAll,
}: {
  totalCount: number
  selectedCount: number
  isAllSelected: boolean
  onSelectAll: (selected: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={(checked) => onSelectAll(!!checked)}
          id="select-all"
        />
        <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
          Chọn tất cả ({selectedCount}/{totalCount} sản phẩm)
        </label>
      </div>
    </div>
  )
}

export function CartItem({
  item,
  isSelected,
  onToggleSelect,
  onUpdateQuantity,
  onRemove,
  isUpdating,
  isRemoving,
}: {
  item: CartItemType
  isSelected: boolean
  onToggleSelect: () => void
  onUpdateQuantity: (productId: number, variantId: number, qty: number) => void
  onRemove: (productId: number, variantId: number) => void
  isUpdating?: boolean
  isRemoving?: boolean
}) {
  return (
    <Card className={`transition-all ${isSelected ? 'border-primary/50 bg-primary/5' : ''}`}>
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} />
          <img
            src={item.product?.image || '/placeholder.png'}
            alt={item.product?.name || 'Sản phẩm'}
            className="size-16 rounded-lg object-cover border"
          />
          <div>
            <h4 className="font-semibold text-sm line-clamp-1">{item.product?.name}</h4>
            {item.variant?.title && (
              <p className="text-xs text-muted-foreground">{item.variant.title}</p>
            )}
            <p className="font-bold text-primary text-sm mt-1">
              {formatCurrency(item.currentPrice)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-4 self-end sm:self-center">
          <div className="flex items-center border rounded-lg">
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={() => onUpdateQuantity(item.productId, item.variantId, item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
            >
              <Minus className="size-3" />
            </Button>
            <span className="px-3 text-xs font-semibold">{item.quantity}</span>
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={() => onUpdateQuantity(item.productId, item.variantId, item.quantity + 1)}
              disabled={isUpdating}
            >
              <Plus className="size-3" />
            </Button>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="size-8 text-destructive hover:text-destructive"
            onClick={() => onRemove(item.productId, item.variantId)}
            disabled={isRemoving}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function CartSummary({
  summary,
  onCheckout,
  onClearCart,
  isCheckoutDisabled,
}: {
  summary: {
    itemCount: number
    totalQuantity: number
    subtotal: number
    hasPriceChanges?: boolean
    hasOutOfStock?: boolean
  }
  onCheckout: () => void
  onClearCart: () => void
  isCheckoutDisabled: boolean
}) {
  return (
    <Card className="sticky top-24">
      <CardContent className="p-6 space-y-4">
        <h3 className="font-bold text-lg">Tóm tắt đơn hàng</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Số lượng:</span>
            <span>{summary.totalQuantity} món ({summary.itemCount} loại)</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t pt-2">
            <span>Tạm tính:</span>
            <span className="text-primary">{formatCurrency(summary.subtotal)}</span>
          </div>
        </div>

        {summary.hasOutOfStock && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 text-destructive text-xs">
            <AlertTriangle className="size-4 shrink-0" />
            <span>Có sản phẩm hết hàng hoặc vượt tồn kho</span>
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={onCheckout}
          disabled={isCheckoutDisabled}
        >
          Tiến hành thanh toán
        </Button>

        <Button
          variant="outline"
          className="w-full text-destructive"
          onClick={onClearCart}
        >
          Xóa toàn bộ giỏ hàng
        </Button>
      </CardContent>
    </Card>
  )
}
