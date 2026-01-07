export interface InvoiceData {
  orderId: number
  userId: number | null
  status: string
  totalAmount: number
  currency: string | null
  shippingProvinceId: number | null
  shippingDistrictId: number | null
  shippingAddressDetail: string | null
  shippingRecipientName: string | null
  shippingPhone: string | null
  shippingAddress: Record<string, unknown> | null
  billingAddress: Record<string, unknown> | null
  shippingMethod: string | null
  shippingFee: number | null
  paymentStatus: string | null
  metadata: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
  placedAt: Date | null
  deliveredAt: Date | null
  deletedAt: Date | null
  orderItems: Array<{
    productId: number
    variantId: number | null
    quantity: number
    unitPrice: number
    totalPrice: number
    discount: number
    product?: {
      name: string
      sku?: string
    }
    variant?: {
      sku: string
      title: string | null
    } | null
  }>
  user?: {
    name: string | null
    email: string
  } | null
  province?: {
    name: string
  } | null
  district?: {
    name: string
    province: {
      name: string
    }
  } | null
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

const getOrderStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Chờ xác nhận',
    processing: 'Đang xử lý',
    shipped: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy',
    returned: 'Đã trả hàng',
  }
  return statusMap[status] || status
}

const getPaymentStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Chờ thanh toán',
    paid: 'Đã thanh toán',
    failed: 'Thất bại',
    refunded: 'Đã hoàn tiền',
  }
  return statusMap[status] || status
}

const getPaymentMethodLabel = (method?: string): string => {
  if (!method) return 'Chưa xác định'
  const methodMap: Record<string, string> = {
    cod: 'Thanh toán khi nhận hàng (COD)',
    bank_transfer: 'Chuyển khoản ngân hàng',
    credit_card: 'Thẻ tín dụng/Ghi nợ',
    e_wallet: 'Ví điện tử',
  }
  return methodMap[method.toLowerCase()] || method
}

export const generateInvoiceHTML = (order: InvoiceData): string => {
  const metadata = order.metadata as { paymentMethod?: string } | null
  const paymentMethod = metadata?.paymentMethod

  const shippingFee = Number(order.shippingFee) || 0
  const totalAmount = Number(order.totalAmount) || 0
  const itemsSubtotal = totalAmount - shippingFee

  // Build shipping address from available fields
  const addressParts = []
  if (order.shippingAddressDetail) {
    addressParts.push(order.shippingAddressDetail)
  }
  if (order.district) {
    addressParts.push(order.district.name)
    if (order.district.province) {
      addressParts.push(order.district.province.name)
    }
  } else if (order.province) {
    addressParts.push(order.province.name)
  }
  const shippingAddress =
    addressParts.length > 0 ? addressParts.join(', ') : 'Chưa có thông tin'

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Hóa đơn #${order.orderId}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      color: #000;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0 0 5px 0;
      font-size: 24px;
    }
    .header p {
      margin: 2px 0;
      font-size: 12px;
    }
    .invoice-info {
      text-align: right;
      margin-bottom: 20px;
    }
    .invoice-info p {
      margin: 5px 0;
    }
    .section {
      margin: 20px 0;
    }
    .section h3 {
      font-size: 14px;
      margin-bottom: 10px;
      border-bottom: 1px solid #000;
      padding-bottom: 5px;
    }
    .info-row {
      margin: 8px 0;
    }
    .info-row strong {
      display: inline-block;
      width: 150px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #000;
      padding: 8px;
      text-align: left;
    }
    th {
      background: #fff;
      font-weight: bold;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .totals {
      margin-top: 20px;
      text-align: right;
    }
    .totals div {
      margin: 5px 0;
    }
    .grand-total {
      font-size: 18px;
      font-weight: bold;
      border-top: 2px solid #000;
      padding-top: 10px;
      margin-top: 10px;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 12px;
      border-top: 1px solid #000;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TECH STORE</h1>
      <p>Địa chỉ: 123 Giải Phóng, Quận Hoàng Mai, TP.Hà Nội</p>
      <p>Điện thoại: (024) 1234 5678 | Email: contact@ecommerce.com</p>
    </div>

    <div class="invoice-info">
      <h2>HÓA ĐƠN #${order.orderId}</h2>
      <p>Ngày đặt: ${formatDate(order.createdAt)}</p>
      ${order.deliveredAt ? `<p>Ngày giao: ${formatDate(order.deliveredAt)}</p>` : ''}
      <p>Trạng thái: ${getOrderStatusLabel(order.status)}</p>
      ${order.paymentStatus ? `<p>Thanh toán: ${getPaymentStatusLabel(order.paymentStatus)}</p>` : ''}
    </div>

    <div class="section">
      <h3>Thông tin khách hàng</h3>
      <div class="info-row"><strong>Họ tên:</strong> ${order.user?.name || order.shippingRecipientName || 'N/A'}</div>
      <div class="info-row"><strong>Email:</strong> ${order.user?.email || 'N/A'}</div>
      <div class="info-row"><strong>Số điện thoại:</strong> ${order.shippingPhone || 'N/A'}</div>
    </div>

    <div class="section">
      <h3>Thông tin giao hàng</h3>
      <div class="info-row"><strong>Địa chỉ:</strong> ${shippingAddress}</div>
      <div class="info-row"><strong>Vận chuyển:</strong> ${order.shippingMethod || 'Tiêu chuẩn'}</div>
      <div class="info-row"><strong>Thanh toán:</strong> ${getPaymentMethodLabel(paymentMethod)}</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Sản phẩm</th>
          <th class="text-center">Số lượng</th>
          <th class="text-right">Đơn giá</th>
          <th class="text-right">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${order.orderItems
          .map(
            (item) => `
        <tr>
          <td>
            ${item.product?.name || 'Sản phẩm không xác định'}
            ${item.variant ? `<br><small>SKU: ${item.variant.sku}${item.variant.title ? ` - ${item.variant.title}` : ''}</small>` : ''}
          </td>
          <td class="text-center">${item.quantity}</td>
          <td class="text-right">${formatCurrency(Number(item.unitPrice))}</td>
          <td class="text-right">${formatCurrency(item.totalPrice)}</td>
        </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>

    <div class="totals">
      <div>Tổng tiền hàng: ${formatCurrency(itemsSubtotal)}</div>
      <div>Phí vận chuyển: ${formatCurrency(shippingFee)}</div>
      <div class="grand-total">TỔNG CỘNG: ${formatCurrency(totalAmount)}</div>
    </div>

    <div class="footer">
      <p><strong>Cảm ơn bạn đã mua hàng!</strong></p>
      <p>Nếu có thắc mắc, vui lòng liên hệ qua email hoặc số điện thoại trên.</p>
    </div>
  </div>
</body>
</html>
  `
}
