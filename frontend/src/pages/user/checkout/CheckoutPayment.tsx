import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Wallet, Banknote, Smartphone } from 'lucide-react'

export type PaymentMethod = 'cod' | 'vnpay' | 'paypal'

export interface PaymentFormData {
  paymentMethod: PaymentMethod
  saveInfo: boolean
}

interface CheckoutPaymentProps {
  formData: PaymentFormData
  onChange: (field: keyof PaymentFormData, value: string | boolean) => void
}

export default function CheckoutPayment({
  formData,
  onChange,
}: CheckoutPaymentProps) {
  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Phương thức thanh toán</Label>
        <RadioGroup
          value={formData.paymentMethod}
          onValueChange={(value) =>
            onChange('paymentMethod', value as PaymentMethod)
          }
          className="space-y-3"
        >
          {/* COD - Cash on Delivery */}
          <div className="hover:bg-accent/50 flex cursor-pointer items-center space-x-3 rounded-lg border p-4">
            <RadioGroupItem value="cod" id="cod-payment" />
            <Banknote className="text-muted-foreground size-5" />
            <div className="flex-1">
              <Label
                htmlFor="cod-payment"
                className="cursor-pointer font-medium"
              >
                Thanh toán khi nhận hàng (COD)
              </Label>
              <p className="text-muted-foreground mt-1 text-xs">
                Thanh toán bằng tiền mặt khi nhận hàng
              </p>
            </div>
          </div>

          {/* VNPay */}
          <div className="hover:bg-accent/50 flex cursor-pointer items-center space-x-3 rounded-lg border p-4">
            <RadioGroupItem value="vnpay" id="vnpay-payment" />
            <Smartphone className="text-muted-foreground size-5" />
            <div className="flex-1">
              <Label
                htmlFor="vnpay-payment"
                className="cursor-pointer font-medium"
              >
                VNPay
              </Label>
              <p className="text-muted-foreground mt-1 text-xs">
                Thanh toán qua ví điện tử VNPay
              </p>
            </div>
          </div>

          {/* PayPal / Stripe */}
          <div className="hover:bg-accent/50 flex cursor-pointer items-center space-x-3 rounded-lg border p-4">
            <RadioGroupItem value="paypal" id="paypal-payment" />
            <Wallet className="text-muted-foreground size-5" />
            <div className="flex-1">
              <Label
                htmlFor="paypal-payment"
                className="cursor-pointer font-medium"
              >
                PayPal / Stripe
              </Label>
              <p className="text-muted-foreground mt-1 text-xs">
                Thanh toán qua PayPal hoặc thẻ quốc tế
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Payment Info Messages */}
      {formData.paymentMethod === 'cod' && (
        <div className="rounded-lg bg-blue-50 p-4 text-sm dark:bg-blue-950/20">
          <p className="text-blue-900 dark:text-blue-100">
            💡 Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng. Vui lòng chuẩn bị
            đủ tiền theo tổng đơn hàng.
          </p>
        </div>
      )}

      {formData.paymentMethod === 'vnpay' && (
        <div className="rounded-lg bg-blue-50 p-4 text-sm dark:bg-blue-950/20">
          <p className="text-blue-900 dark:text-blue-100">
            💡 Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao
            dịch.
          </p>
        </div>
      )}

      {formData.paymentMethod === 'paypal' && (
        <div className="rounded-lg bg-blue-50 p-4 text-sm dark:bg-blue-950/20">
          <p className="text-blue-900 dark:text-blue-100">
            💡 Bạn sẽ được chuyển đến PayPal hoặc Stripe để hoàn tất thanh toán
            an toàn.
          </p>
        </div>
      )}
    </div>
  )
}
