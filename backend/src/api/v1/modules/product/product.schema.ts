import { z } from 'zod'
import {
  createPaginationSchema,
  numericIdParamSchema,
} from '../../shared/schemas'

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  sku: z.string(),
  shortDescription: z.string().nullable(),
  description: z.string().nullable(),
  status: z.enum(['active', 'inactive', 'out_of_stock', 'draft']),
  brandId: z.number(),
  categoryId: z.number(),
  isFeatured: z.boolean(),
  metaData: z.json().nullable(),
  weightGrams: z.number().nullable(),
  dimensions: z.json().nullable(),
  publishedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

const PRODUCT_SORT_FIELDS = ['createdAt', 'name', 'sku', 'status'] as const

export const listProductsQuerySchema = createPaginationSchema(
  PRODUCT_SORT_FIELDS as unknown as string[],
).extend({
  sku: z.string().optional(),
})

export const productIdParamSchema = numericIdParamSchema

export const createProductBodySchema = z.object({
  name: z
    .string()
    .min(6, 'Name must be at least 6 characters')
    .trim()
    .optional(),
  sku: z.string().min(1, 'SKU must be at least 1 character').trim().optional(),
  shortDescription: z.string().trim().optional(),
  description: z.string().trim().optional(),
  status: z.enum(['active', 'inactive', 'out_of_stock', 'draft']).optional(),
  brandId: z.number().int().optional(),
  categoryId: z.number().int().optional(),
  isFeatured: z
    .boolean()
    .optional()
    .transform((v) => v ?? false),
  metaData: z
    .json()
    .optional()
    .transform((v) => v ?? undefined),
  weightGrams: z.number().optional(),
  dimensions: z
    .json()
    .optional()
    .transform((v) => v ?? undefined),
  publishedAt: z.date().nullable().optional(),
})

export const updateProductBodySchema = z.object({
  name: z
    .string()
    .min(6, 'Name must be at least 6 characters')
    .trim()
    .optional(),
  sku: z.string().min(1, 'SKU must be at least 1 character').trim().optional(),
  shortDescription: z.string().trim().optional(),
  description: z
    .string()
    .max(5000, 'Description must be at most 5000 characters')
    .trim()
    .optional(),
  status: z.enum(['active', 'inactive', 'out_of_stock', 'draft']).optional(),
  brandId: z.number().int().optional(),
  categoryId: z.number().int().optional(),
  isFeatured: z
    .boolean()
    .optional()
    .transform((v) => v ?? false),
  metaData: z
    .json()
    .optional()
    .transform((v) => v ?? undefined),
  weightGrams: z.number().optional(),
  dimensions: z
    .json()
    .optional()
    .transform((v) => v ?? undefined),
  publishedAt: z.date().nullable().optional(),
})

export const productStatusParamSchema = z.object({
  status: z.enum(['active', 'inactive', 'out_of_stock', 'draft']),
})

export type Product = z.infer<typeof productSchema>

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>
export type ProductIdParam = z.infer<typeof productIdParamSchema>
export type CreateProductBody = z.infer<typeof createProductBodySchema>
export type UpdateProductBody = z.infer<typeof updateProductBodySchema>
