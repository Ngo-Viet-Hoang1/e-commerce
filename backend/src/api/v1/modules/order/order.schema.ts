import { z } from 'zod'
import {
  createPaginationSchema,
  numericIdParamSchema,
} from '../../shared/schemas'
import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
} from './order.constants'

export const orderSchema = z.object({
  orderId: z.number(),
  userId: z.number().optional(),

  totalAmount: z.number(),
  currency: z.string().optional(),

  shippingProvinceId: z.number().optional(),
  shippingDistrictId: z.number().optional(),
  shippingAddressDetail: z.string().optional(),
  shippingRecipientName: z.string().optional(),
  shippingPhone: z.string().optional(),

  billingAddress: z.record(z.string(), z.any()).optional(),

  shippingMethod: z.string().optional(),
  shippingFee: z.number().optional(),

  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  metadata: z.record(z.string(), z.any()).optional(),

  createdAt: z.date(),
  updatedAt: z.date(),
  placedAt: z.date().optional(),
  deliveredAt: z.date().optional(),
  deletedAt: z.date().optional(),
})

export const orderDtoSchema = orderSchema

export const orderIdParamSchema = numericIdParamSchema

export const userOrderIdParamSchema = z.object({
  orderId: z.string().regex(/^\d+$/).transform(Number),
})

const orderItemInputSchema = z.object({
  productId: z.number().int().positive(),
  variantId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  discount: z.number().min(0).optional().default(0),
})

export const createOrderBodySchema = z.object({
  userId: z.number().optional(),

  status: z.enum(ORDER_STATUSES).default('pending'),
  currency: z.string().default('VND'),

  items: z.array(orderItemInputSchema).min(1),

  shippingProvinceId: z.number().optional(),
  shippingDistrictId: z.number().optional(),
  shippingAddressDetail: z.string().optional(),
  shippingRecipientName: z.string().optional(),
  shippingPhone: z.string().optional(),
  shippingAddress: z.record(z.string(), z.any()).optional().nullable(),

  billingAddress: z.record(z.string(), z.any()).optional().nullable(),

  shippingMethod: z.string().optional(),
  shippingFee: z.number().min(0).optional().default(0),

  paymentStatus: z.enum(PAYMENT_STATUSES).default('pending'),
  paymentMethod: z.enum(PAYMENT_METHODS).optional().default('cod'),
  metadata: z.record(z.string(), z.any()).optional(),
})

export const updateOrderBodySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  totalAmount: z.number().optional(),
  currency: z.string().optional(),

  shippingProvinceId: z.number().optional(),
  shippingDistrictId: z.number().optional(),
  shippingAddressDetail: z.string().optional(),
  shippingRecipientName: z.string().optional(),
  shippingPhone: z.string().optional(),
  shippingAddress: z.record(z.string(), z.any()).optional(),

  billingAddress: z.record(z.string(), z.any()).optional(),

  shippingMethod: z.string().optional(),
  shippingFee: z.number().optional(),

  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional().default('cod'),
  metadata: z.record(z.string(), z.any()).optional(),

  placedAt: z.string().optional(),
  deliveredAt: z.string().optional(),
  deletedAt: z.string().optional(),
})

export const updateOrderStatusBodySchema = z.object({
  status: z.enum(ORDER_STATUSES),
  paymentStatus: z.enum(PAYMENT_STATUSES),
})

const ORDER_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'status',
  'totalAmount',
] as const

export const listOrdersQuerySchema = createPaginationSchema(
  ORDER_SORT_FIELDS as unknown as string[],
).extend({
  status: z.enum(ORDER_STATUSES).optional(),
  userId: z.number().optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
})

export type listOrdersQuerySchema = z.infer<typeof listOrdersQuerySchema>

export type OrderDto = z.infer<typeof orderDtoSchema>

export type OrderIdParam = z.infer<typeof orderIdParamSchema>

export type CreateOrderBody = z.infer<typeof createOrderBodySchema>
export type UpdateOrderBody = z.infer<typeof updateOrderBodySchema>
export type UpdateOrderStatusBody = z.infer<typeof updateOrderStatusBodySchema>
