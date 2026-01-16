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
  brandId: z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === '') return undefined
      const parsed = Number(val)
      return Number.isNaN(parsed) ? undefined : parsed
    },
    z.number().int().positive().optional(),
  ),
  isFeatured: z
    .string()
    .optional()
    .transform((v) =>
      v === 'true' ? true : v === 'false' ? false : undefined,
    ),
})

export const productIdParamSchema = numericIdParamSchema
export const productSlugParamSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
})

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

export const productStatusParamSchema = z.object({
  status: z.enum(['active', 'inactive', 'out_of_stock', 'draft']),
})

export const createSimpleVariantSchema = z.object({
  sku: z.string().min(1, 'Variant SKU is required'),
  title: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  costPrice: z.number().positive().optional(),
  msrp: z.number().positive().optional(),
  stockQuantity: z.number().int().min(0).default(0),
  isDefault: z.boolean().default(false),
  attributes: z
    .array(
      z.object({
        attributeName: z.string().min(1, 'Attribute name is required'),
        value: z.string().min(1, 'Attribute value is required'),
      }),
    )
    .optional(),
  images: z
    .array(
      z.object({
        url: z.string().url('Invalid image URL'),
        altText: z.string().optional(),
        isPrimary: z.boolean().default(false),
      }),
    )
    .optional(),
})

export const createSimpleProductBodySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').trim(),
  sku: z.string().min(1, 'Product SKU is required').trim(),
  brandId: z.number().int('Brand ID is required'),
  categoryId: z.number().int('Category ID is required'),

  description: z.string().trim().optional(),
  status: z.enum(['active', 'inactive', 'draft']).default('draft'),
  isFeatured: z
    .boolean()
    .optional()
    .transform((v) => v ?? false),

  variants: z
    .array(createSimpleVariantSchema)
    .min(1, 'At least one variant is required'),

  images: z
    .array(
      z.object({
        url: z.string().url('Invalid image URL'),
        altText: z.string().optional(),
        isPrimary: z.boolean().default(false),
      }),
    )
    .optional(),
})

export type Product = z.infer<typeof productSchema>

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>
export type ProductIdParam = z.infer<typeof productIdParamSchema>
export type ProductSlugParam = z.infer<typeof productSlugParamSchema>
export type CreateProductBody = z.infer<typeof createProductBodySchema>
export type UpdateProductBody = z.infer<typeof updateProductBodySchema>
export type CreateSimpleProductBody = z.infer<
  typeof createSimpleProductBodySchema
>
