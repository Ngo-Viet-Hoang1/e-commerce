import {
  StatusDropdown,
  type StatusOption,
} from '@/components/common/StatusDropdown'
import {
  getAvailableOrderStatuses,
  getAvailablePaymentStatuses,
  getOrderStatusColor,
  getPaymentStatusColor,
  getPaymentStatusLabel,
  type OrderStatus,
  type PaymentStatus,
} from '@/constants/order.constants'

interface OrderStatusDropdownProps {
  currentStatus: string
  onStatusChange: (newStatus: OrderStatus) => void
  disabled?: boolean
}

export function OrderStatusDropdown({
  currentStatus,
  onStatusChange,
  disabled = false,
}: OrderStatusDropdownProps) {
  const options = getAvailableOrderStatuses(
    currentStatus,
  ) as StatusOption<OrderStatus>[]

  return (
    <StatusDropdown<OrderStatus>
      currentStatus={currentStatus.toLowerCase() as OrderStatus}
      options={options}
      onStatusChange={onStatusChange}
      getStatusColor={getOrderStatusColor}
      disabled={disabled}
    />
  )
}

interface PaymentStatusDropdownProps {
  currentStatus: string
  onStatusChange: (newStatus: PaymentStatus) => void
  disabled?: boolean
}

export function PaymentStatusDropdown({
  currentStatus,
  onStatusChange,
  disabled = false,
}: PaymentStatusDropdownProps) {
  const options = getAvailablePaymentStatuses(
    currentStatus,
  ) as StatusOption<PaymentStatus>[]

  return (
    <StatusDropdown<PaymentStatus>
      currentStatus={currentStatus.toLowerCase() as PaymentStatus}
      options={options}
      onStatusChange={onStatusChange}
      getStatusColor={getPaymentStatusColor}
      getStatusLabel={getPaymentStatusLabel}
      disabled={disabled}
    />
  )
}
