import { Prisma } from '@generated/prisma/client'
import { z } from 'zod'
import {
  createPaginationSchema,
  numericIdParamSchema,
} from '../../shared/schemas'

const decimalToNumber = z.union([
  z.number(),
  z.instanceof(Prisma.Decimal).transform((v) => v.toNumber()),
])

export const orderItemSchema = z.object({
  id: z.number(),

  orderId: z.number(),
  productId: z.number(),
  variantId: z.number(),

  quantity: z.number(),

  unitPrice: decimalToNumber,
  totalPrice: decimalToNumber,

  discount: decimalToNumber,

  metadata: z.json().optional().nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const ORDER_ITEM_SORT_FIELDS = [
  'createdAt',
  'unitPrice',
  'totalPrice',
  'quantity',
  'discount',
] as const

export const listOrderItemsQuerySchema = createPaginationSchema(
  ORDER_ITEM_SORT_FIELDS as unknown as string[],
).extend({
  orderId: z.coerce.number().int().positive().optional(),

  productId: z.coerce.number().int().positive().optional(),

  variantId: z.coerce.number().int().positive().optional(),

  minQuantity: z.coerce.number().int().positive().optional(),

  maxQuantity: z.coerce.number().int().positive().optional(),
})

export const orderItemIdParamSchema = numericIdParamSchema

export const createOrderItemBodySchema = z.object({
  orderId: z.number().int().positive(),
  productId: z.number().int().positive(),
  variantId: z.number().int().positive(),

  quantity: z.number().int().positive(),

  discount: z.number().min(0).optional().default(0),

  metadata: z.json().optional().nullable(),
})

export const updateOrderItemBodySchema = z.object({
  quantity: z.number().int().positive().optional(),

  unitPrice: z.number().positive().optional(),

  discount: z.number().min(0).optional(),

  metadata: z.json().optional().nullable(),
})

export const updateOrderItemVariantBodySchema = z.object({
  variantId: z.number().int().positive(),
})

export type OrderItem = z.infer<typeof orderItemSchema>

export type ListOrderItemsQuery = z.infer<typeof listOrderItemsQuerySchema>

export type OrderItemIdParam = z.infer<typeof orderItemIdParamSchema>

export type CreateOrderItemBody = z.infer<typeof createOrderItemBodySchema>
export type updateOrderItemBody = z.infer<typeof updateOrderItemBodySchema>

export type UpdateOrderItemVariantBodySchema = z.infer<
  typeof updateOrderItemVariantBodySchema
>
