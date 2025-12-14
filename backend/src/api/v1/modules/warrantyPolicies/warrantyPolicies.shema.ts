import { z } from 'zod'
import {
  createPaginationSchema,
  numericIdParamSchema,
} from '../../shared/schemas'

export const warrantyPolicySchema = z.object({
  id: z.number(),
  productId: z.number(),
  brandId: z.number(),
  title: z.string().min(2).max(255),
  description: z.string().nullable(),
  durationDays: z.number().min(0),
  termsUrl: z.string().url().nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

const WARRANTY_POLICY_SORT_FIELDS = ['createdAt', 'title'] as const

export const listWarrantyPoliciesQuerySchema = createPaginationSchema(
  WARRANTY_POLICY_SORT_FIELDS as unknown as string[],
)

export const warrantyPolicyIdParamSchema = numericIdParamSchema

export const createWarrantyPolicyBodySchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(255, 'Title must be at most 255 characters')
    .trim(),
  description: z.string().nullable().optional(),
  durationDays: z.number().min(0, 'Duration days must be at least 0'),
  termsUrl: z.string().url().optional(),
})

export const updateWarrantyPolicyBodySchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(255, 'Title must be at most 255 characters')
    .optional(),
  description: z.string().nullable().optional(),
  durationDays: z.number().min(0).optional(),
  termsUrl: z.string().url().nullable().optional(),
  deletedAt: z.string().optional(),
})

export type WarrantyPolicy = z.infer<typeof warrantyPolicySchema>

export type ListWarrantyPoliciesQuery = z.infer<
  typeof listWarrantyPoliciesQuerySchema
>
export type warrantyPolicyIdParamSchema = z.infer<
  typeof warrantyPolicyIdParamSchema
>
export type CreateWarrantyPolicyBody = z.infer<
  typeof createWarrantyPolicyBodySchema
>
export type UpdateWarrantyPolicyBody = z.infer<
  typeof updateWarrantyPolicyBodySchema
>
