import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  getOrderStatusColor,
  getPaymentStatusColor,
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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Order #{order.orderId}</h2>
        <Badge
          variant="secondary"
          className={getOrderStatusColor(order.status)}
        >
          {order.status}
        </Badge>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Order Information</h3>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          {showCustomerEmail && (
            <InfoItem label="Customer" value={order.user?.email ?? 'N/A'} />
          )}
          <InfoItem
            label="Total Amount"
            value={formatCurrency(order.totalAmount, order.currency ?? 'USD')}
          />
          <InfoItem
            label="Payment Status"
            value={
              order.paymentStatus ? (
                <Badge
                  variant="secondary"
                  className={getPaymentStatusColor(order.paymentStatus)}
                >
                  {order.paymentStatus}
                </Badge>
              ) : (
                'N/A'
              )
            }
          />
          <InfoItem
            label="Shipping Method"
            value={
              order.shippingMethod ? (
                <div>
                  <div>{order.shippingMethod}</div>
                  {order.shippingFee && (
                    <div className="text-muted-foreground text-xs">
                      Fee:{' '}
                      {formatCurrency(
                        order.shippingFee,
                        order.currency ?? 'USD',
                      )}
                    </div>
                  )}
                </div>
              ) : (
                'N/A'
              )
            }
          />
          <InfoItem
            label="Placed At"
            value={order.placedAt ? formatDate(order.placedAt) : '—'}
          />
          <InfoItem
            label="Delivered At"
            value={order.deliveredAt ? formatDate(order.deliveredAt) : '—'}
          />
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Shipping Address</h3>

        <div className="space-y-3 rounded-lg border p-4">
          {order.shippingRecipientName && (
            <InfoItem
              label="Recipient Name"
              value={order.shippingRecipientName}
            />
          )}
          {order.shippingPhone && (
            <InfoItem label="Phone" value={order.shippingPhone} />
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
            <h3 className="text-lg font-semibold">Billing Address</h3>

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
            <h3 className="text-lg font-semibold">Order Items</h3>

            <div className="space-y-2">
              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Product #{item.productId}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Qty: {item.quantity} ×{' '}
                      {formatCurrency(item.unitPrice, order.currency ?? 'USD')}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatCurrency(item.totalPrice, order.currency ?? 'USD')}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export { InfoItem }
