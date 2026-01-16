import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  getOrderStatusColor,
  getOrderStatusLabel,
  getPaymentStatusColor,
  getPaymentStatusLabel,
} from '@/constants/order.constants'
import type { Order } from '@/interfaces/order.interface'
import { formatCurrency, formatDate } from '@/lib/format'
import {
  CalendarIcon,
  CreditCardIcon,
  Download,
  MapPinIcon,
  PackageIcon,
  PhoneIcon,
  TruckIcon,
  UserIcon,
} from 'lucide-react'
import { useState } from 'react'

interface OrderDetailProps {
  order: Order
  showCustomerEmail?: boolean
  onExportPDF?: (orderId: number) => Promise<void>
}

interface InfoItemProps {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
}

function InfoItem({ label, value, icon }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="text-muted-foreground mt-0.5">{icon}</div>}
      <div className="flex-1">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium">
          {value ?? <span className="text-muted-foreground">—</span>}
        </p>
      </div>
    </div>
  )
}

export function OrderDetail({
  order,
  showCustomerEmail = false,
  onExportPDF,
}: OrderDetailProps) {
  const [isExporting, setIsExporting] = useState(false)

  const shippingFee = order.shippingFee ?? 0
  const totalAmount = order.totalAmount

  const handleExportPDF = async () => {
    if (!onExportPDF) return

    try {
      setIsExporting(true)
      await onExportPDF(order.orderId)
    } catch (error) {
      console.error('Failed to export PDF:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const metadata = order.metadata as { paymentMethod?: string } | null
  const paymentMethod = metadata?.paymentMethod

  const getPaymentMethodLabel = (method?: string) => {
    if (!method) return 'Chưa xác định'
    switch (method.toLowerCase()) {
      case 'cod':
        return 'Thanh toán khi nhận hàng (COD)'
      case 'bank_transfer':
        return 'Chuyển khoản ngân hàng'
      case 'credit_card':
        return 'Thẻ tín dụng/Ghi nợ'
      case 'e_wallet':
        return 'Ví điện tử'
      default:
        return method
    }
  }

  return (
    <div className="space-y-6 print:space-y-4 print:text-black">
      {/* Export PDF Button */}
      {onExportPDF && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Đang xuất...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Xuất PDF
              </>
            )}
          </Button>
        </div>
      )}

      {/* Header Section */}
      <div className="rounded-lg border bg-gradient-to-br from-slate-50 to-slate-100 p-6 print:rounded-none print:border-0 print:bg-white print:p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Đơn hàng #{order.orderId}
            </h2>
            <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
              <CalendarIcon className="h-3.5 w-3.5" />
              Ngày đặt: {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground text-xs font-medium">
                Đơn hàng:
              </span>
              <Badge
                variant="secondary"
                className={`${getOrderStatusColor(order.status)} px-2.5 py-0.5 text-sm font-semibold`}
              >
                {getOrderStatusLabel(order.status)}
              </Badge>
            </div>
            {order.paymentStatus && (
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground text-xs font-medium">
                  Thanh toán:
                </span>
                <Badge
                  variant="secondary"
                  className={`${getPaymentStatusColor(order.paymentStatus)} px-2.5 py-0.5 text-sm font-semibold`}
                >
                  {getPaymentStatusLabel(order.paymentStatus)}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Information Grid */}
      <div className="grid gap-6 md:grid-cols-2 print:gap-4">
        {/* Payment & Shipping Information */}
        <Card className="print:border-slate-300 print:shadow-none">
          <CardHeader className="pb-3 print:pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCardIcon className="h-4 w-4" />
              Thanh toán & Vận chuyển
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoItem
              label="Phương thức thanh toán"
              value={getPaymentMethodLabel(paymentMethod)}
              icon={<CreditCardIcon className="h-4 w-4" />}
            />
            <InfoItem
              label="Phương thức vận chuyển"
              value={order.shippingMethod ?? 'Tiêu chuẩn'}
              icon={<TruckIcon className="h-4 w-4" />}
            />
            {order.deliveredAt && (
              <InfoItem
                label="Ngày giao hàng"
                value={formatDate(order.deliveredAt)}
                icon={<CalendarIcon className="h-4 w-4" />}
              />
            )}
          </CardContent>
        </Card>

        {/* Shipping Address */}
        {(order.shippingRecipientName ??
          order.shippingPhone ??
          order.province ??
          order.district ??
          order.shippingAddressDetail) && (
          <Card className="print:border-slate-300 print:shadow-none">
            <CardHeader className="pb-3 print:pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPinIcon className="h-4 w-4" />
                Địa chỉ giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.shippingRecipientName && (
                <InfoItem
                  label="Người nhận"
                  value={order.shippingRecipientName}
                  icon={<UserIcon className="h-4 w-4" />}
                />
              )}
              {order.shippingPhone && (
                <InfoItem
                  label="Số điện thoại"
                  value={order.shippingPhone}
                  icon={<PhoneIcon className="h-4 w-4" />}
                />
              )}
              {(order.province ??
                order.district ??
                order.shippingAddressDetail) && (
                <InfoItem
                  label="Địa chỉ"
                  value={[
                    order.shippingAddressDetail,
                    order.district?.name,
                    order.province?.name,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                  icon={<MapPinIcon className="h-4 w-4" />}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Customer Information */}
        {showCustomerEmail && order.user?.email && (
          <Card className="print:border-slate-300 print:shadow-none">
            <CardHeader className="pb-3 print:pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserIcon className="h-4 w-4" />
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoItem
                label="Email"
                value={order.user.email}
                icon={<UserIcon className="h-4 w-4" />}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Products Table */}
      {order.orderItems && order.orderItems.length > 0 && (
        <Card className="print:border-slate-300 print:shadow-none">
          <CardHeader className="pb-3 print:pb-2">
            <CardTitle className="flex items-center gap-2 text-base print:text-lg">
              <PackageIcon className="h-4 w-4 print:hidden" />
              Danh sách sản phẩm
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 print:px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Sản phẩm</TableHead>
                  <TableHead className="text-center">Số lượng</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="pr-6 text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.orderItems.map((item) => {
                  const productName =
                    item.product?.name ?? `Sản phẩm #${item.productId}`
                  const productSku = item.product?.sku
                  const variantName = item.variant?.title
                  const image =
                    item.variant?.productImages?.[0] ??
                    item.product?.productImages?.[0]

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          {image ? (
                            <img
                              src={image.url}
                              alt={image.altText ?? productName}
                              className="size-12 rounded-md border object-cover"
                            />
                          ) : (
                            <div className="flex size-12 items-center justify-center rounded-md border bg-slate-50">
                              <PackageIcon className="text-muted-foreground h-5 w-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium">{productName}</p>
                            {variantName && (
                              <p className="text-muted-foreground text-xs">
                                {variantName}
                              </p>
                            )}
                            {productSku && (
                              <p className="text-muted-foreground text-xs">
                                SKU: {productSku}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          item.unitPrice,
                          order.currency ?? 'VND',
                        )}
                        {item.discount > 0 && (
                          <span className="ml-1 text-xs text-green-600">
                            (-
                            {formatCurrency(
                              item.discount,
                              order.currency ?? 'VND',
                            )}
                            )
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right font-semibold">
                        {formatCurrency(
                          item.totalPrice,
                          order.currency ?? 'VND',
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
              <TableFooter>
                {shippingFee > 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="pl-6 text-right">
                      Phí vận chuyển
                    </TableCell>
                    <TableCell className="pr-6 text-right font-medium">
                      {formatCurrency(shippingFee, order.currency ?? 'VND')}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow className="bg-slate-50">
                  <TableCell
                    colSpan={3}
                    className="pl-6 text-right text-base font-semibold"
                  >
                    Tổng cộng
                  </TableCell>
                  <TableCell className="pr-6 text-right text-lg font-bold">
                    {formatCurrency(totalAmount, order.currency ?? 'VND')}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Billing Address - if exists */}
      {order.billingAddress && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCardIcon className="h-4 w-4" />
              Địa chỉ thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="rounded-lg bg-slate-50 p-4 text-sm wrap-break-word whitespace-pre-wrap">
              {JSON.stringify(order.billingAddress, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Footer note */}
      <div className="text-muted-foreground rounded-lg border border-dashed bg-slate-50 p-4 text-center text-xs print:mt-8 print:border-0 print:bg-white">
        <p className="print:text-slate-600">
          Cảm ơn bạn đã mua hàng! Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ
          với chúng tôi.
        </p>
      </div>

      {/* Signature section - Print only */}
      <div className="hidden print:mt-12 print:block">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <p className="font-semibold">Người mua hàng</p>
            <p className="text-xs text-slate-500 italic">
              (Ký và ghi rõ họ tên)
            </p>
            <div className="mt-20"></div>
          </div>
          <div className="text-center">
            <p className="font-semibold">Người bán hàng</p>
            <p className="text-xs text-slate-500 italic">
              (Ký và ghi rõ họ tên)
            </p>
            <div className="mt-20"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { InfoItem }
