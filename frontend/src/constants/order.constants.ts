export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipped', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' },
]

export const ORDER_STATUS_ORDER: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
]

export const getAvailableOrderStatuses = (
  currentStatus: string,
): { value: OrderStatus; label: string; disabled: boolean }[] => {
  const current = currentStatus.toLowerCase() as OrderStatus
  const currentIndex = ORDER_STATUS_ORDER.indexOf(current)

  return ORDER_STATUS_OPTIONS.map((opt) => {
    const optIndex = ORDER_STATUS_ORDER.indexOf(opt.value)

    if (opt.value === 'cancelled') {
      return { ...opt, disabled: false }
    }

    const isDisabled = optIndex < currentIndex

    return { ...opt, disabled: isDisabled }
  })
}

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
} as const

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

export const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] =
  [
    { value: 'pending', label: 'Chờ thanh toán' },
    { value: 'paid', label: 'Đã thanh toán' },
    { value: 'failed', label: 'Thất bại' },
  ]

export const getAvailablePaymentStatuses = (
  currentStatus: string,
): { value: PaymentStatus; label: string; disabled: boolean }[] => {
  const current = currentStatus.toLowerCase() as PaymentStatus

  return PAYMENT_STATUS_OPTIONS.map((opt) => {
    if (current === 'paid') {
      return { ...opt, disabled: true }
    }

    if (current === 'pending') {
      return { ...opt, disabled: false }
    }

    if (current === 'failed') {
      return { ...opt, disabled: opt.value === 'pending' }
    }

    return { ...opt, disabled: false }
  })
}

export const ORDER_STATUS_COLOR: Record<string, string> = {
  pending:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
  processing:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
  shipped:
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800',
  delivered:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
  cancelled:
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800',
}

export const PAYMENT_STATUS_COLOR: Record<string, string> = {
  pending:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
  failed:
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800',
}

export const getOrderStatusColor = (status: string) => {
  return (
    ORDER_STATUS_COLOR[status.toLowerCase()] ??
    'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
  )
}

export const getPaymentStatusColor = (status: string) => {
  return (
    PAYMENT_STATUS_COLOR[status.toLowerCase()] ??
    'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
  )
}

export const getOrderStatusLabel = (status: string) => {
  const option = ORDER_STATUS_OPTIONS.find(
    (opt) => opt.value === status.toLowerCase(),
  )
  return option?.label ?? status
}

export const getPaymentStatusLabel = (status: string) => {
  const option = PAYMENT_STATUS_OPTIONS.find(
    (opt) => opt.value === status.toLowerCase(),
  )
  return option?.label ?? status
}
