import { z } from 'zod'
import {
  numericIdParamSchema,
  createPaginationSchema,
} from '../../shared/schemas'

export const orderSchema = z.object({
  orderId: z.number(),
  userId: z.number().optional(),

  status: z.string(),
  totalAmount: z.number(),
  currency: z.string().optional(),

  shippingAddress: z.record(z.string(), z.any()).optional(),
  billingAddress: z.record(z.string(), z.any()).optional(),

  shippingMethod: z.string().optional(),
  shippingFee: z.number().optional(),

  paymentStatus: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),

  createdAt: z.date(),
  updatedAt: z.date(),
  placedAt: z.date().optional(),
  deliveredAt: z.date().optional(),
  deletedAt: z.date().optional(),
})

export const orderDtoSchema = orderSchema

export const orderIdParamSchema = numericIdParamSchema

export const createOrderBodySchema = z.object({
  userId: z.number().optional(),

  status: z.string(),
  totalAmount: z.number(),
  currency: z.string().default('USD'),

  shippingAddress: z.record(z.string(), z.any()).optional(),
  billingAddress: z.record(z.string(), z.any()).optional(),

  shippingMethod: z.string().optional(),
  shippingFee: z.number().optional(),

  paymentStatus: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),

  placedAt: z.string().optional(),
  deliveredAt: z.string().optional(),
})

export const updateOrderBodySchema = z.object({
  status: z.string().optional(),
  totalAmount: z.number().optional(),
  currency: z.string().optional(),

  shippingAddress: z.record(z.string(), z.any()).optional(),
  billingAddress: z.record(z.string(), z.any()).optional(),

  shippingMethod: z.string().optional(),
  shippingFee: z.number().optional(),

  paymentStatus: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),

  placedAt: z.string().optional(),
  deliveredAt: z.string().optional(),
  deletedAt: z.string().optional(),
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
  status: z.string().optional(),
  userId: z.number().optional(),
  paymentStatus: z.string().optional(),
})

export type listOrdersQuerySchema = z.infer<typeof listOrdersQuerySchema>

export type OrderDto = z.infer<typeof orderDtoSchema>

export type OrderIdParam = z.infer<typeof orderIdParamSchema>

export type CreateOrderBody = z.infer<typeof createOrderBodySchema>
export type UpdateOrderBody = z.infer<typeof updateOrderBodySchema>
