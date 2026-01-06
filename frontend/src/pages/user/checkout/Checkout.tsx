import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { CartItem } from '@/interfaces/cart.interface'
import { ArrowLeft, Lock, ShoppingBag } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import type { Address } from '@/interfaces/location.interface'
import { useAddresses } from '@/pages/user/profile/Address/address.queries'
import { useAuthStore } from '@/store/zustand/useAuthStore'
import CheckoutAddressSelector from './CheckoutAddressSelector'
import CheckoutContactInfo, {
  type ContactFormData,
} from './CheckoutContactInfo'
import CheckoutOrderSummary, {
  type OrderSummaryData,
} from './CheckoutOrderSummary'
import CheckoutPayment, { type PaymentFormData } from './CheckoutPayment'
import CheckoutProgressSteps from './CheckoutProgressSteps'

export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { me } = useAuthStore()
  const { data: addresses = [] } = useAddresses(!!me?.id)

  const [step, setStep] = useState(1)

  const [contactData, setContactData] = useState<ContactFormData>(() => {
    if (me) {
      const nameParts = me.name?.split(' ') ?? []
      return {
        email: me.email ?? '',
        firstName: nameParts.slice(0, -1).join(' ') ?? '',
        lastName: nameParts[nameParts.length - 1] ?? '',
        phone: me.phoneNumber ?? '',
      }
    }
    return {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
    }
  })

  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)

  const defaultAddress = useMemo(() => {
    if (addresses.length === 0) return null
    return addresses.find((a) => a.isDefault) ?? addresses[0]
  }, [addresses])

  const effectiveSelectedId =
    (selectedAddressId || defaultAddress?.id.toString()) ?? ''
  const effectiveSelectedAddress = selectedAddress ?? defaultAddress

  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    paymentMethod: 'cod',
    saveInfo: false,
  })

  const [promoCode, setPromoCode] = useState('')

  const selectedItems = useMemo(() => {
    return (
      (location.state as { selectedItems?: CartItem[] })?.selectedItems ?? []
    )
  }, [location.state])

  const orderSummary = useMemo<OrderSummaryData>(() => {
    const subtotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0)
    const shipping = 0
    const tax = subtotal * 0.1

    return {
      items: selectedItems.map((item) => ({
        id: item.productId.toString(),
        name: item.product.name,
        variant: item.variant.title ?? 'Mặc định',
        price: item.currentPrice,
        quantity: item.quantity,
        image: item.product.image ?? undefined,
      })),
      subtotal,
      shipping,
      tax,
      discount: 0,
      promoDiscount: 0,
    }
  }, [selectedItems])

  if (selectedItems.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag className="text-muted-foreground/50 mb-4 h-12 w-12" />
          <h3 className="text-lg font-medium">
            Không có sản phẩm nào được chọn
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Vui lòng quay lại giỏ hàng và chọn sản phẩm để thanh toán
          </p>
          <Button className="mt-4" onClick={() => navigate('/cart')}>
            Quay lại giỏ hàng
          </Button>
        </CardContent>
      </Card>
    )
  }

  const handleContactChange = (field: keyof ContactFormData, value: string) => {
    setContactData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddressSelect = (addressId: string, address: Address) => {
    setSelectedAddressId(addressId)
    setSelectedAddress(address)
  }

  const handlePaymentChange = (
    field: keyof PaymentFormData,
    value: string | boolean,
  ) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!contactData.email) {
        toast.error('Vui lòng nhập email')
        return false
      }
      if (!contactData.firstName || !contactData.lastName) {
        toast.error('Vui lòng nhập họ và tên')
        return false
      }
      if (!contactData.phone) {
        toast.error('Vui lòng nhập số điện thoại')
        return false
      }
    }
    if (currentStep === 2) {
      if (!effectiveSelectedId || !effectiveSelectedAddress) {
        toast.error('Vui lòng chọn địa chỉ giao hàng')
        return false
      }
    }
    return true
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 3))
    }
  }
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

  return (
    <>
      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="mb-1 text-2xl font-bold text-balance">
          Thanh toán đơn hàng
        </h1>
        <p className="text-muted-foreground text-sm">
          Hoàn tất đơn hàng chỉ với vài bước đơn giản
        </p>
      </div>

      {/* Progress Indicator */}
      <CheckoutProgressSteps currentStep={step} />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Main Form */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-balance">
                {step === 1 && 'Thông tin liên hệ'}
                {step === 2 && 'Địa chỉ giao hàng'}
                {step === 3 && 'Thông tin thanh toán'}
              </CardTitle>
              <CardDescription className="text-xs">
                {step === 1 &&
                  'Chúng tôi sẽ sử dụng thông tin này để cập nhật đơn hàng'}
                {step === 2 && 'Chọn địa chỉ giao hàng của bạn'}
                {step === 3 &&
                  'Thông tin thanh toán của bạn được bảo mật và mã hóa'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Contact Information */}
              {step === 1 && (
                <CheckoutContactInfo
                  formData={contactData}
                  onChange={handleContactChange}
                />
              )}

              {/* Step 2: Address Selection */}
              {step === 2 && (
                <CheckoutAddressSelector
                  selectedAddressId={effectiveSelectedId}
                  onAddressSelect={handleAddressSelect}
                />
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <CheckoutPayment
                  formData={paymentData}
                  onChange={handlePaymentChange}
                />
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <ArrowLeft className="size-4" />
                  Quay lại
                </Button>

                {step < 3 ? (
                  <Button onClick={nextStep} className="cursor-pointer">
                    Tiếp tục
                  </Button>
                ) : (
                  <Button className="flex cursor-pointer items-center gap-2">
                    <Lock className="size-4" />
                    Hoàn tất đơn hàng
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <CheckoutOrderSummary
            orderSummary={orderSummary}
            promoCode={promoCode}
            onPromoCodeChange={setPromoCode}
          />
        </div>
      </div>
    </>
  )
}
