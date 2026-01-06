import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/format'
import { Gift, Shield, Tag, Truck } from 'lucide-react'

export interface OrderItem {
  id: string
  name: string
  variant: string
  price: number
  quantity: number
  image?: string
}

export interface OrderSummaryData {
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  promoDiscount: number
}

interface CheckoutOrderSummaryProps {
  orderSummary: OrderSummaryData
  promoCode: string
  onPromoCodeChange: (code: string) => void
  onApplyPromo?: () => void
}

export default function CheckoutOrderSummary({
  orderSummary,
  promoCode,
  onPromoCodeChange,
  onApplyPromo,
}: CheckoutOrderSummaryProps) {
  const total =
    orderSummary.subtotal +
    orderSummary.shipping +
    orderSummary.tax -
    orderSummary.discount -
    orderSummary.promoDiscount

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="text-balance">Tóm tắt đơn hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items */}
        <div className="space-y-3">
          {orderSummary.items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-20 w-20 rounded-lg border object-cover"
                />
                <Badge
                  variant="secondary"
                  className="absolute -end-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full p-0 text-xs font-semibold"
                >
                  {item.quantity}
                </Badge>
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <h4 className="line-clamp-2 text-sm leading-tight font-medium">
                  {item.name}
                </h4>
                <p className="text-muted-foreground text-xs">
                  Phân loại: <span className="font-medium">{item.variant}</span>
                </p>
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">
                      Đơn giá
                    </span>
                    <span className="text-primary text-sm font-semibold">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-muted-foreground text-xs">
                      Thành tiền
                    </span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Promo Code */}
        <div className="space-y-2">
          <Label htmlFor="promoCode" className="text-sm">
            Mã giảm giá
          </Label>
          <div className="flex gap-2">
            <Input
              id="promoCode"
              placeholder="Nhập mã giảm giá"
              value={promoCode}
              onChange={(e) => onPromoCodeChange(e.target.value)}
            />
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={onApplyPromo}
            >
              Áp dụng
            </Button>
          </div>
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tạm tính</span>
            <span className="font-medium">
              {formatCurrency(orderSummary.subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Truck className="size-3" />
              Vận chuyển
            </span>
            <span className="font-medium text-green-600">
              {orderSummary.shipping === 0
                ? 'Miễn phí'
                : formatCurrency(orderSummary.shipping)}
            </span>
          </div>
          {orderSummary.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Thuế VAT (10%)</span>
              <span className="font-medium">
                {formatCurrency(orderSummary.tax)}
              </span>
            </div>
          )}
          {orderSummary.promoDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span className="flex items-center gap-1">
                <Tag className="size-3" />
                Giảm giá
              </span>
              <span className="font-medium">
                -{formatCurrency(orderSummary.promoDiscount)}
              </span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between font-semibold">
          <span>Tổng cộng</span>
          <span className="text-primary">{formatCurrency(total)}</span>
        </div>

        {/* Trust Indicators */}
        <div className="space-y-3 pt-4">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Shield className="size-4 text-green-600" />
            <span>Thanh toán được mã hóa SSL</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Truck className="size-4 text-blue-600" />
            <span>Miễn phí vận chuyển toàn quốc</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Gift className="size-4 text-purple-600" />
            <span>Chính sách đổi trả trong 30 ngày</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
