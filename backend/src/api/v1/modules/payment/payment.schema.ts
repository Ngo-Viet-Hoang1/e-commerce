import { z } from 'zod'
import {
  createPaginationSchema,
  numericIdParamSchema,
} from '../../shared/schemas'

export const paymentSchema = z.object({
  id: z.number(),
  orderId: z.number(),
  userId: z.number(),
  paymentMethod: z.string(),
  paymentStatus: z.string(),
  transactionId: z.string().nullable(),
  amount: z.number(),
  currency: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

const PAYMENT_SORT_FIELDS = ['createdAt', 'amount', 'paymentStatus'] as const

export const listPaymentsQuerySchema = createPaginationSchema(
  PAYMENT_SORT_FIELDS as unknown as string[],
)

export const paymentIdParamSchema = numericIdParamSchema

export const createPaymentBodySchema = z.object({
  orderId: z.number(),
  userId: z.number(),
  paymentMethod: z.enum([
    'credit_card',
    'paypal',
    'bank_transfer',
    'cod',
    ' momo',
    'vnpay',
  ]),
  paymentStatus: z.enum([
    'pending',
    'completed',
    'failed',
    'refunded',
    'canceled',
    'processing',
  ]),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'VND', 'VNĐ']),
  metaData: z.json().nullable().optional(),
})

export const updatePaymentBodySchema = z.object({
  orderId: z.number(),
  userId: z.number(),
  paymentMethod: z.enum([
    'credit_card',
    'paypal',
    'bank_transfer',
    'cod',
    ' momo',
    'vnpay',
  ]),
  paymentStatus: z.enum([
    'pending',
    'completed',
    'failed',
    'refunded',
    'canceled',
    'processing',
  ]),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'VND', 'VNĐ']),
  metaData: z.json().nullable().optional(),
})

export type PaymentSchema = z.infer<typeof paymentSchema>

export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>
export type PaymentIdParam = z.infer<typeof paymentIdParamSchema>
export type CreatePaymentBody = z.infer<typeof createPaymentBodySchema>
export type UpdatePaymentBody = z.infer<typeof updatePaymentBodySchema>
