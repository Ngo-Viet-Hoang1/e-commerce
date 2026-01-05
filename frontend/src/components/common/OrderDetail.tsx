import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  getOrderStatusColor,
  getOrderStatusLabel,
  getPaymentStatusColor,
  getPaymentStatusLabel,
} from '@/constants/order.constants'
import type { Order } from '@/interfaces/order.interface'
import { formatCurrency, formatDate } from '@/lib/format'

interface OrderDetailProps {
  order: Order
  showCustomerEmail?: boolean
}

interface InfoItemProps {
  label: string
  value: React.ReactNode
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <p className="text-muted-foreground text-xs font-semibold uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm">
        {value ?? <span className="text-muted-foreground">—</span>}
      </p>
    </div>
  )
}

export function OrderDetail({
  order,
  showCustomerEmail = false,
}: OrderDetailProps) {
  const calculatedSubtotal =
    order.orderItems?.reduce((sum, item) => sum + item.totalPrice, 0) ?? 0
  const shippingFee = order.shippingFee ?? 0
  const calculatedTotal = calculatedSubtotal + shippingFee

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Đơn hàng #{order.orderId}</h2>
        <Badge
          variant="secondary"
          className={getOrderStatusColor(order.status)}
        >
          {getOrderStatusLabel(order.status)}
        </Badge>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Thông tin đơn hàng</h3>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          {showCustomerEmail && (
            <InfoItem label="Khách hàng" value={order.user?.email ?? 'N/A'} />
          )}
          <InfoItem
            label="Tạm tính (Sản phẩm)"
            value={
              <div className="space-y-1">
                <div>
                  {formatCurrency(calculatedSubtotal, order.currency ?? 'VND')}
                </div>
                {shippingFee > 0 && (
                  <div className="text-muted-foreground text-xs">
                    + Phí vận chuyển:{' '}
                    {formatCurrency(shippingFee, order.currency ?? 'VND')}
                  </div>
                )}
                <div className="font-semibold">
                  Tổng:{' '}
                  {formatCurrency(calculatedTotal, order.currency ?? 'VND')}
                </div>
              </div>
            }
          />
          <InfoItem
            label="Trạng thái thanh toán"
            value={
              order.paymentStatus ? (
                <Badge
                  variant="secondary"
                  className={getPaymentStatusColor(order.paymentStatus)}
                >
                  {getPaymentStatusLabel(order.paymentStatus)}
                </Badge>
              ) : (
                'N/A'
              )
            }
          />
          <InfoItem
            label="Phương thức vận chuyển"
            value={order.shippingMethod ?? 'N/A'}
          />
          <InfoItem
            label="Ngày đặt"
            value={order.placedAt ? formatDate(order.placedAt) : '—'}
          />
          <InfoItem
            label="Ngày giao"
            value={order.deliveredAt ? formatDate(order.deliveredAt) : '—'}
          />
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Địa chỉ giao hàng</h3>

        <div className="space-y-3 rounded-lg border p-4">
          {order.shippingRecipientName && (
            <InfoItem label="Người nhận" value={order.shippingRecipientName} />
          )}
          {order.shippingPhone && (
            <InfoItem label="Số điện thoại" value={order.shippingPhone} />
          )}
          {(order.province ?? order.district) && (
            <InfoItem
              label="Địa chỉ (Tỉnh/Thành phố - Quận/Huyện)"
              value={
                <div className="flex flex-col gap-1">
                  {order.province && (
                    <span>
                      <span className="text-muted-foreground">
                        Tỉnh/Thành phố:
                      </span>{' '}
                      {order.province.name}
                    </span>
                  )}
                  {order.district && (
                    <span>
                      <span className="text-muted-foreground">Quận/Huyện:</span>{' '}
                      {order.district.name}
                    </span>
                  )}
                </div>
              }
            />
          )}
          {order.shippingAddressDetail && (
            <InfoItem
              label="Chi tiết địa chỉ (Phường/Xã, Đường, Số nhà)"
              value={order.shippingAddressDetail}
            />
          )}

          {!order.shippingRecipientName &&
            !order.shippingPhone &&
            !order.province &&
            !order.district &&
            !order.shippingAddressDetail && (
              <p className="text-muted-foreground text-sm">—</p>
            )}
        </div>
      </section>

      {order.billingAddress && (
        <>
          <Separator />
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Địa chỉ thanh toán</h3>

            <div className="rounded-lg border p-4">
              <pre className="text-sm wrap-break-word whitespace-pre-wrap">
                {JSON.stringify(order.billingAddress, null, 2)}
              </pre>
            </div>
          </section>
        </>
      )}

      {order.orderItems && order.orderItems.length > 0 && (
        <>
          <Separator />
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Sản phẩm</h3>

            <div className="space-y-2">
              {order.orderItems.map((item) => {
                const productName =
                  item.product?.name ?? `Sản phẩm #${item.productId}`
                const productSku = item.product?.sku
                const variantName = item.variant?.title

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{productName}</p>
                      {productSku && (
                        <p className="text-muted-foreground text-xs">
                          SKU: {productSku}
                        </p>
                      )}
                      {variantName && (
                        <p className="text-muted-foreground text-xs">
                          Phân loại: {variantName}
                          {item.variant?.sku && ` (${item.variant.sku})`}
                        </p>
                      )}
                      <p className="text-muted-foreground mt-1 text-xs">
                        SL: {item.quantity} ×{' '}
                        {formatCurrency(
                          item.unitPrice,
                          order.currency ?? 'VND',
                        )}
                        {item.discount > 0 && (
                          <span className="ml-2 text-green-600">
                            (-
                            {formatCurrency(
                              item.discount,
                              order.currency ?? 'VND',
                            )}
                            )
                          </span>
                        )}
                      </p>
                    </div>

                    <p className="text-right font-semibold">
                      {formatCurrency(item.totalPrice, order.currency ?? 'VND')}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export { InfoItem }
