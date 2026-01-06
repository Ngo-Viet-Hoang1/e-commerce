export interface ProductImage {
  imageId: number
  url: string
  altText: string | null
  isPrimary: boolean
}

export interface OrderItemProduct {
  id: number
  name: string
  sku: string
  productImages?: ProductImage[]
}

export interface OrderItemVariant {
  id: number
  title: string | null
  sku: string | null
  price: number
  productImages?: ProductImage[]
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  variantId: number | null
  quantity: number
  unitPrice: number
  totalPrice: number
  discount: number
  metadata: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  product?: OrderItemProduct
  variant?: OrderItemVariant | null
}

export interface Order {
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
  orderItems?: OrderItem[]
  user?: {
    id: number
    email: string
    name: string | null
  }
  province?: {
    id: number
    name: string
  }
  district?: {
    id: number
    name: string
  }
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface OrderItemInput {
  productId: number
  variantId: number
  quantity: number
  discount?: number
}

export interface CreateOrderPayload {
  items: OrderItemInput[]

  shippingRecipientName: string
  shippingPhone: string

  shippingProvinceId: number
  shippingDistrictId: number
  shippingAddressDetail?: string

  paymentMethod: 'card' | 'cod' | 'vnpay' | 'paypal'
  paymentStatus?: PaymentStatus

  shippingFee?: number
  currency?: string
}
