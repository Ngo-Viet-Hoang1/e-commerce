import { z } from 'zod'
import {
  createPaginationSchema,
  numericIdParamSchema,
} from '../../shared/schemas'

export const productFaqSchema = z.object({
  id: z.number(),
  productId: z.number(),
  userId: z.number(),
  question: z.string(),
  answer: z.string().nullable(),
  answeredBy: z.number().nullable(),
  isPublic: z.boolean(),
  status: z.enum(['pending', 'answered', 'rejected']),
  createdAt: z.date(),
  updatedAt: z.date(),
  answeredAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
})

const PRODUCT_FAQ_SORT_FIELDS = ['createdAt', 'status'] as const

export const listProductFaqsQuerySchema = createPaginationSchema(
  PRODUCT_FAQ_SORT_FIELDS as unknown as string[],
)

export const productFaqIdParamSchema = numericIdParamSchema

export const createProductFaqBodySchema = z.object({
  productId: z.number().int().optional(),
  userId: z.number().int().optional(),
  question: z
    .string()
    .min(5, 'Question must be at least 5 characters')
    .trim()
    .optional(),
  answer: z
    .string()
    .min(5, 'Answer must be at least 5 characters')
    .trim()
    .optional(),
  status: z.enum(['pending', 'answered', 'rejected']).optional(),
  isPublic: z.boolean().optional(),
  answeredByUserId: z.number().int().optional(),
})

export const updateProductFaqBodySchema = z.object({
  productId: z.number().int().optional(),
  userId: z.number().int().optional(),
  question: z
    .string()
    .min(5, 'Question must be at least 5 characters')
    .trim()
    .optional(),
  answer: z
    .string()
    .min(5, 'Answer must be at least 5 characters')
    .trim()
    .optional(),
  status: z.enum(['pending', 'answered', 'rejected']).optional(),
  isPublic: z.boolean().optional(),
  answeredByUserId: z.number().int().optional(),
})

export type ProductFaq = z.infer<typeof productFaqSchema>

export type ListProductFaqsQuery = z.infer<typeof listProductFaqsQuerySchema>
export type CreateProductFaqBody = z.infer<typeof createProductFaqBodySchema>
export type ProductFaqIdParam = z.infer<typeof productFaqIdParamSchema>
export type UpdateProductFaqBody = z.infer<typeof updateProductFaqBodySchema>
