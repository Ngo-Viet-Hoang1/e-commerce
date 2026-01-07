import {
  CheckCircle,
  CreditCard,
  Home,
  MapPin,
  Package,
  Printer,
  ShoppingBag,
  Truck,
} from 'lucide-react'

import { cn } from '@/lib/utils'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useUserOrderById } from '@/hooks/useOrder'
import { useNavigate, useParams } from 'react-router-dom'
import type { OrderStatus } from '@/interfaces/order.interface'
import { Skeleton } from '@/components/ui/skeleton'

interface CompleteCheckoutProps {
  className?: string
}

const CompleteCheckout = ({ className }: CompleteCheckoutProps) => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { data: order, isLoading } = useUserOrderById(Number(orderId))

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const getStatusBadge = (status: OrderStatus) => {
    const variants: Record<OrderStatus, { label: string; className: string }> =
      {
        pending: {
          label: 'Chờ xác nhận',
          className: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/10',
        },
        processing: {
          label: 'Đang xử lý',
          className: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/10',
        },
        shipped: {
          label: 'Đang giao',
          className: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/10',
        },
        delivered: {
          label: 'Đã giao',
          className:
            'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10',
        },
        cancelled: {
          label: 'Đã hủy',
          className: 'bg-red-500/10 text-red-600 hover:bg-red-500/10',
        },
        refunded: {
          label: 'Đã hoàn tiền',
          className: 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/10',
        },
      }
    return variants[status]
  }

  if (isLoading) {
    return (
      <section className={cn('py-16 md:py-24', className)}>
        <div className="container max-w-4xl">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </section>
    )
  }

  if (!order) {
    return (
      <section className={cn('py-16 md:py-24', className)}>
        <div className="container max-w-4xl text-center">
          <Package className="text-muted-foreground/50 mx-auto mb-4 size-12" />
          <h2 className="mb-2 text-xl font-semibold">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-muted-foreground mb-4">
            Đơn hàng này không tồn tại hoặc đã bị xóa
          </p>
          <Button onClick={() => navigate('/')}>Về trang chủ</Button>
        </div>
      </section>
    )
  }

  const statusBadge = getStatusBadge(order.status as OrderStatus)
  const userEmail = order.user?.email ?? 'N/A'
  const orderDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const paymentMethodMeta = order.metadata as { paymentMethod?: string } | null
  const paymentMethod = paymentMethodMeta?.paymentMethod ?? 'cod'

  return (
    <section className={cn('py-4', className)}>
      <div className="container">
        {/* Success Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle className="size-8 text-emerald-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
            Cảm ơn bạn đã đặt hàng!
          </h1>
          <p className="text-muted-foreground">
            Email xác nhận đã được gửi tới{' '}
            <span className="text-foreground font-medium">{userEmail}</span>
          </p>
        </div>

        {/* Order Info Bar */}
        <Card className="mb-6 shadow-none">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div>
                <p className="text-muted-foreground text-sm">Mã đơn hàng</p>
                <p className="font-semibold">#{order.orderId}</p>
              </div>
              <Separator
                orientation="vertical"
                className="hidden h-10 md:block"
              />
              <div>
                <p className="text-muted-foreground text-sm">Ngày đặt</p>
                <p className="font-medium">{orderDate}</p>
              </div>
            </div>
            <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Items & Totals */}
          <div className="space-y-6 lg:col-span-2">
            {/* Order Items */}
            <Card className="shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="size-5" />
                  Sản phẩm đã đặt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.orderItems?.map((item, index) => {
                  const imageUrl =
                    item.variant?.productImages?.[0]?.url ??
                    item.product?.productImages?.[0]?.url ??
                    'https://placehold.co/400x400?text=No+Image'
                  const productName = item.product?.name ?? 'N/A'
                  const variantTitle = item.variant?.title

                  return (
                    <div key={item.id}>
                      <div className="flex gap-4">
                        <div className="w-20 shrink-0">
                          <AspectRatio
                            ratio={1}
                            className="bg-muted overflow-hidden rounded-lg"
                          >
                            <img
                              src={imageUrl}
                              alt={productName}
                              className="size-full object-cover"
                            />
                          </AspectRatio>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium">{productName}</h3>
                          {variantTitle && (
                            <p className="text-muted-foreground mt-0.5 text-sm">
                              {variantTitle}
                            </p>
                          )}
                          <p className="text-muted-foreground mt-1 text-sm">
                            Số lượng: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatPrice(Number(item.totalPrice))}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-muted-foreground text-sm">
                              {formatPrice(Number(item.unitPrice))} /sp
                            </p>
                          )}
                        </div>
                      </div>
                      {index < (order.orderItems?.length ?? 0) - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Order Totals */}
            <Card className="shadow-none">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span>
                      {formatPrice(
                        Number(order.totalAmount) -
                          Number(order.shippingFee ?? 0),
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Phí vận chuyển
                    </span>
                    <span>
                      {Number(order.shippingFee ?? 0) === 0
                        ? 'Miễn phí'
                        : formatPrice(Number(order.shippingFee))}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Tổng thanh toán</span>
                    <span>{formatPrice(Number(order.totalAmount))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Shipping & Payment */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <Card className="shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="size-5" />
                  Địa chỉ giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">
                    {order.shippingRecipientName ?? 'N/A'}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {order.shippingPhone ?? 'N/A'}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {order.shippingAddressDetail ?? 'N/A'}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {order.district?.name}, {order.province?.name}
                  </p>
                </div>
                {order.shippingMethod && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Truck className="text-muted-foreground mt-0.5 size-4" />
                      <div>
                        <p className="text-sm font-medium">
                          {order.shippingMethod}
                        </p>
                        {order.deliveredAt && (
                          <p className="text-muted-foreground text-sm">
                            Đã giao:{' '}
                            {new Date(order.deliveredAt).toLocaleDateString(
                              'vi-VN',
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="size-5" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex size-10 items-center justify-center rounded-md">
                    {paymentMethod === 'cod' && (
                      <CreditCard className="size-5" />
                    )}
                    {paymentMethod === 'vnpay' && (
                      <span className="text-xs font-bold">VNP</span>
                    )}
                    {paymentMethod === 'paypal' && (
                      <img
                        src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/paypal-icon.svg"
                        alt="PayPal"
                        className="size-5"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {paymentMethod === 'cod' &&
                        'Thanh toán khi nhận hàng (COD)'}
                      {paymentMethod === 'vnpay' && 'VNPay'}
                      {paymentMethod === 'paypal' && 'PayPal'}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {order.paymentStatus === 'paid' && 'Đã thanh toán'}
                      {order.paymentStatus === 'pending' && 'Chờ thanh toán'}
                      {order.paymentStatus === 'failed' &&
                        'Thanh toán thất bại'}
                      {order.paymentStatus === 'refunded' && 'Đã hoàn tiền'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="shadow-none">
              <CardContent className="space-y-3 p-4">
                <Button
                  className="w-full"
                  variant="default"
                  onClick={() => navigate('/profile/orders')}
                >
                  <Package className="mr-2 size-4" />
                  Xem đơn hàng
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  <Home className="mr-2 size-4" />
                  Về trang chủ
                </Button>
                <Button
                  className="w-full"
                  variant="ghost"
                  onClick={() => window.print()}
                >
                  <Printer className="mr-2 size-4" />
                  In đơn hàng
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground mb-4">
            Có câu hỏi về đơn hàng của bạn?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={() => navigate('/contact')}>
              Liên hệ hỗ trợ
            </Button>
            <Button onClick={() => navigate('/')}>
              <ShoppingBag className="mr-2 size-4" />
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CompleteCheckout
