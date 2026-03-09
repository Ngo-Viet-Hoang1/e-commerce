import { Prisma } from '@generated/prisma/client'
import {
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from '../order/order.constants'
import type { ORDER_SELECT_FIELDS } from '../order/order.repository'
import { parseOrderMetadata } from '../order/order.util'
import { formatCurrency, formatDateTime } from './invoice.util'

export type InvoiceData = Prisma.OrderGetPayload<{
  select: typeof ORDER_SELECT_FIELDS
}>

export const generateInvoiceHTML = (order: InvoiceData): string => {
  const { paymentMethod } = parseOrderMetadata<{ paymentMethod: string }>(
    order.metadata,
  )

  const shippingFee = Number(order.shippingFee) || 0
  const totalAmount = Number(order.totalAmount) || 0
  const itemsSubtotal = totalAmount - shippingFee

  const shippingAddress =
    [
      order.shippingAddressDetail,
      order.district?.name,
      order.district?.province?.name ?? order.province?.name,
    ]
      .filter(Boolean)
      .join(', ') || 'Chưa có thông tin'

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Hóa đơn #${order.orderId}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font: 13px/1.6 'DM Sans', sans-serif; color: #1a1a1a; padding: 48px; }
    .mono { font-family: 'DM Mono', monospace; }
    .muted { color: #888; }
    .label { font-size: 11px; letter-spacing: .8px; text-transform: uppercase; color: #888; margin-bottom: 4px; }

    .row { display: flex; justify-content: space-between; align-items: flex-start; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .meta { display: flex; gap: 40px; }

    .border-b-heavy { border-bottom: 2px solid #1a1a1a; padding-bottom: 24px; margin-bottom: 28px; }
    .border-y { border-top: 1px solid #e8e8e8; border-bottom: 1px solid #e8e8e8; padding: 20px 0; margin: 20px 0; }

    table { width: 100%; border-collapse: collapse; }
    th { font-size: 11px; letter-spacing: .8px; text-transform: uppercase; color: #888; font-weight: 500; padding-bottom: 10px; border-bottom: 1px solid #1a1a1a; }
    td { padding: 12px 0; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
    th:not(:first-child), td:not(:first-child) { text-align: right; }

    .totals { width: 220px; margin-left: auto; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e8e8e8; }
    .totals-row { display: flex; justify-content: space-between; padding: 3px 0; color: #555; }
    .totals-row.grand { font-size: 15px; font-weight: 600; color: #1a1a1a; margin-top: 10px; padding-top: 10px; border-top: 1px solid #1a1a1a; }

    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e8e8e8; display: flex; justify-content: space-between; font-size: 11.5px; color: #999; }
  </style>
</head>
<body>

  <div class="row border-b-heavy">
    <div>
      <div style="font-size:20px;font-weight:600">TECH STORE</div>
      <div class="muted" style="margin-top:6px;font-size:12px;line-height:1.8">
        123 Giải Phóng, Quận Hoàng Mai, TP.Hà Nội<br>
        (024) 1234 5678 · contact@ecommerce.com
      </div>
    </div>
    <div style="text-align:right">
      <div class="label">Hóa đơn</div>
      <div class="mono" style="font-size:20px">#${order.orderId}</div>
    </div>
  </div>

  <div class="meta" style="margin-bottom:20px">
    <div><div class="label">Ngày đặt</div>${formatDateTime(order.createdAt)}</div>
    ${order.deliveredAt ? `<div><div class="label">Ngày giao</div>${formatDateTime(order.deliveredAt)}</div>` : ''}
    <div><div class="label">Trạng thái</div>${getOrderStatusLabel(order.status)}</div>
    ${order.paymentStatus ? `<div><div class="label">Thanh toán</div>${getPaymentStatusLabel(order.paymentStatus)}</div>` : ''}
  </div>

  <div class="grid2 border-y">
    <div>
      <div class="label">Khách hàng</div>
      <div>${order.user?.name || order.shippingRecipientName || 'N/A'}</div>
      <div class="muted">${order.user?.email || 'N/A'}</div>
      <div class="muted">${order.shippingPhone || 'N/A'}</div>
    </div>
    <div>
      <div class="label">Giao hàng</div>
      <div>${shippingAddress}</div>
      <div class="muted">${order.shippingMethod || 'Tiêu chuẩn'}</div>
      <div class="muted">${getPaymentMethodLabel(paymentMethod!)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th>
      </tr>
    </thead>
    <tbody>
      ${order.orderItems
        .map(
          (item) => `
      <tr>
        <td>
          <div style="font-weight:500">${item.product?.name || 'Sản phẩm không xác định'}</div>
          ${item.variant ? `<div class="mono muted" style="font-size:11px;margin-top:2px">SKU: ${item.variant.sku}${item.variant.title ? ` · ${item.variant.title}` : ''}</div>` : ''}
        </td>
        <td>${item.quantity}</td>
        <td>${formatCurrency(Number(item.unitPrice))}</td>
        <td>${formatCurrency(Number(item.totalPrice))}</td>
      </tr>`,
        )
        .join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row"><span>Tiền hàng</span><span>${formatCurrency(itemsSubtotal)}</span></div>
    <div class="totals-row"><span>Phí vận chuyển</span><span>${formatCurrency(shippingFee)}</span></div>
    <div class="totals-row grand"><span>Tổng cộng</span><span>${formatCurrency(totalAmount)}</span></div>
  </div>

  <div class="footer">
    <span style="color:#555;font-weight:500">Cảm ơn bạn đã mua hàng!</span>
    <span>Thắc mắc? Liên hệ contact@ecommerce.com</span>
  </div>

</body>
</html>`
}
