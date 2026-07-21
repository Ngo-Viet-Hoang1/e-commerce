export const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
] as const

export const PAYMENT_STATUSES = [
  'pending',
  'paid',
  'failed',
  'refunded',
] as const

export const PAYMENT_METHODS = ['cod', 'vnpay', 'paypal', 'card'] as const

export const OrderStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
} as const

export const PaymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const

export const PaymentMethod = {
  COD: 'cod',
  VNPAY: 'vnpay',
  PAYPAL: 'paypal',
  CARD: 'card',
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  processing: 'Đang xử lý',
  shipped: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  cancelled: 'Đã hủy',
  returned: 'Đã trả hàng',
}
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thanh toán thất bại',
  refunded: 'Đã hoàn tiền',
}
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: 'Thanh toán khi nhận hàng',
  vnpay: 'VNPAY',
  paypal: 'PayPal',
  card: 'Thẻ tín dụng',
}

export const getOrderStatusLabel = (status: string): string => {
  return (
    ORDER_STATUS_LABELS[status as OrderStatus] || 'Trạng thái không xác định'
  )
}
export const getPaymentStatusLabel = (status: string): string => {
  return (
    PAYMENT_STATUS_LABELS[status as PaymentStatus] ||
    'Trạng thái không xác định'
  )
}
export const getPaymentMethodLabel = (method: string): string => {
  return (
    PAYMENT_METHOD_LABELS[method as PaymentMethod] ||
    'Phương thức không xác định'
  )
}
