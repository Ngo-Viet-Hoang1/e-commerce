import {
  CheckCircle,
  CreditCard,
  Download,
  MapPin,
  Package,
  Printer,
  Truck,
} from 'lucide-react'

import { cn } from '@/lib/utils'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface OrderItem {
  id: string
  name: string
  image: string
  price: number
  quantity: number
  details?: { label: string; value: string }[]
}

interface ShippingAddress {
  name: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface PaymentMethod {
  type: 'card' | 'paypal' | 'bank'
  lastFour?: string
  cardBrand?: string
  email?: string
}

interface OrderSummaryData {
  orderNumber: string
  orderDate: string
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered'
  email: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  discount?: number
  total: number
  shippingAddress: ShippingAddress
  shippingMethod: string
  estimatedDelivery: string
  paymentMethod: PaymentMethod
}

const DEFAULT_ORDER: OrderSummaryData = {
  orderNumber: 'ORD-2024-78432',
  orderDate: 'December 14, 2024',
  status: 'confirmed',
  email: 'customer@example.com',
  items: [
    {
      id: '1',
      name: 'Minimalist Beige Sneakers',
      image:
        'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/clothes/Minimalist-Beige-Sneakers-2.png',
      price: 120.0,
      quantity: 1,
      details: [
        { label: 'Size', value: '42' },
        { label: 'Color', value: 'Beige' },
      ],
    },
    {
      id: '2',
      name: 'Embroidered Blue Top',
      image:
        'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/clothes/Woman-in-Embroidered-Blue-Top-2.png',
      price: 140.0,
      quantity: 2,
      details: [
        { label: 'Size', value: 'M' },
        { label: 'Color', value: 'Blue' },
      ],
    },
    {
      id: '3',
      name: 'Classic Fedora Hat',
      image:
        'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/accessories/Classic-Fedora-Hat-2.png',
      price: 84.0,
      quantity: 1,
      details: [{ label: 'Size', value: 'One Size' }],
    },
  ],
  subtotal: 484.0,
  shipping: 12.0,
  tax: 38.72,
  discount: 50.0,
  total: 484.72,
  shippingAddress: {
    name: 'Alex Johnson',
    street: '1234 Maple Street, Apt 5B',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'United States',
  },
  shippingMethod: 'Express Shipping',
  estimatedDelivery: 'December 18-20, 2024',
  paymentMethod: {
    type: 'card',
    lastFour: '4242',
    cardBrand: 'Visa',
  },
}

interface OrderSummary1Props {
  order?: OrderSummaryData
  className?: string
}

const OrderSummary1 = ({
  order = DEFAULT_ORDER,
  className,
}: OrderSummary1Props) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const getStatusBadge = (status: OrderSummaryData['status']) => {
    const variants: Record<
      OrderSummaryData['status'],
      { label: string; className: string }
    > = {
      confirmed: {
        label: 'Order Confirmed',
        className: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10',
      },
      processing: {
        label: 'Processing',
        className: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/10',
      },
      shipped: {
        label: 'Shipped',
        className: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/10',
      },
      delivered: {
        label: 'Delivered',
        className: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10',
      },
    }
    return variants[status]
  }

  const statusBadge = getStatusBadge(order.status)

  return (
    <section className={cn('py-16 md:py-24', className)}>
      <div className="container max-w-4xl">
        {/* Success Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle className="size-8 text-emerald-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
            Thank you for your order!
          </h1>
          <p className="text-muted-foreground">
            A confirmation email has been sent to{' '}
            <span className="text-foreground font-medium">{order.email}</span>
          </p>
        </div>

        {/* Order Info Bar */}
        <Card className="mb-6 shadow-none">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div>
                <p className="text-muted-foreground text-sm">Order Number</p>
                <p className="font-semibold">{order.orderNumber}</p>
              </div>
              <Separator
                orientation="vertical"
                className="hidden h-10 md:block"
              />
              <div>
                <p className="text-muted-foreground text-sm">Order Date</p>
                <p className="font-medium">{order.orderDate}</p>
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
                  Items Ordered
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex gap-4">
                      <div className="w-20 shrink-0">
                        <AspectRatio
                          ratio={1}
                          className="bg-muted overflow-hidden rounded-lg"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="size-full object-cover"
                          />
                        </AspectRatio>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        {item.details && (
                          <p className="text-muted-foreground mt-0.5 text-sm">
                            {item.details.map((d, i) => (
                              <span key={d.label}>
                                {d.value}
                                {i < item.details!.length - 1 && ' · '}
                              </span>
                            ))}
                          </p>
                        )}
                        <p className="text-muted-foreground mt-1 text-sm">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-muted-foreground text-sm">
                            {formatPrice(item.price)} each
                          </p>
                        )}
                      </div>
                    </div>
                    {index < order.items.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Order Totals */}
            <Card className="shadow-none">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {order.shipping === 0
                        ? 'Free'
                        : formatPrice(order.shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                  {order.discount && order.discount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Discount</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Paid</span>
                    <span>{formatPrice(order.total)}</span>
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
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {order.shippingAddress.street}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zipCode}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {order.shippingAddress.country}
                  </p>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Truck className="text-muted-foreground mt-0.5 size-4" />
                  <div>
                    <p className="text-sm font-medium">
                      {order.shippingMethod}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Estimated delivery: {order.estimatedDelivery}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="size-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.paymentMethod.type === 'card' && (
                  <div className="flex items-center gap-3">
                    <img
                      src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/visa-icon.svg"
                      alt="Visa"
                      className="size-8"
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {order.paymentMethod.cardBrand} ending in{' '}
                        {order.paymentMethod.lastFour}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Payment completed
                      </p>
                    </div>
                  </div>
                )}
                {order.paymentMethod.type === 'paypal' && (
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex size-10 items-center justify-center rounded-md">
                      <img
                        src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/paypal-icon.svg"
                        alt="PayPal"
                        className="size-5"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">PayPal</p>
                      <p className="text-muted-foreground text-sm">
                        {order.paymentMethod.email}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="shadow-none">
              <CardContent className="space-y-3 p-4">
                <Button className="w-full" variant="default">
                  <Package className="mr-2 size-4" />
                  Track Order
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="mr-2 size-4" />
                  Download Receipt
                </Button>
                <Button className="w-full" variant="ghost">
                  <Printer className="mr-2 size-4" />
                  Print Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground mb-4">
            Have a question about your order?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" asChild>
              <a href="#">Contact Support</a>
            </Button>
            <Button asChild>
              <a href="#">Continue Shopping</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export { OrderSummary1 }
