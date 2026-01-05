import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { CartSummary as ICartSummary } from '@/interfaces/cart.interface'
import { formatCurrency } from '@/lib/format'
import { AlertTriangle, CreditCard, Shield } from 'lucide-react'

interface CartSummaryProps {
  summary: ICartSummary
  onCheckout: () => void
  onClearCart: () => void
  isCheckoutDisabled?: boolean
}

export function CartSummary({
  summary,
  onCheckout,
  onClearCart,
  isCheckoutDisabled,
}: CartSummaryProps) {
  const canCheckout =
    summary.itemCount > 0 && !summary.hasOutOfStock && !isCheckoutDisabled

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Tóm tắt </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Details */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Sản phẩm ({summary.itemCount})
            </span>
            <span className="font-medium">{summary.totalQuantity} món</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tạm tính</span>
            <span className="font-medium">
              {formatCurrency(summary.subtotal)}
            </span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold">Tổng cộng</span>
            <span className="text-xl font-bold">
              {formatCurrency(summary.subtotal)}
            </span>
          </div>
        </div>

        {/* Warnings */}
        {summary.hasPriceChanges && (
          <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-950/20">
            <div className="flex gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-blue-600" />
              <p className="text-xs text-blue-600">
                Một số giá đã được cập nhật. Vui lòng kiểm tra lại giỏ hàng.
              </p>
            </div>
          </div>
        )}

        {summary.hasOutOfStock && (
          <div className="rounded-md bg-amber-50 p-3 dark:bg-amber-950/20">
            <div className="flex gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-600">
                Một số sản phẩm đã hết hàng hoặc vượt quá số lượng có sẵn. Vui
                lòng cập nhật giỏ hàng.
              </p>
            </div>
          </div>
        )}

        {/* Trust Badges */}
        <div className="bg-muted/50 space-y-2 rounded-md p-3">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Shield className="h-4 w-4" />
            <span>Thanh toán bảo mật</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <CreditCard className="h-4 w-4" />
            <span>Nhiều phương thức thanh toán</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button
          className="w-full"
          size="lg"
          onClick={onCheckout}
          disabled={!canCheckout}
        >
          Tiến hành thanh toán
        </Button>

        {summary.itemCount > 0 && (
          <Button variant="outline" className="w-full" onClick={onClearCart}>
            Xóa giỏ hàng
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
