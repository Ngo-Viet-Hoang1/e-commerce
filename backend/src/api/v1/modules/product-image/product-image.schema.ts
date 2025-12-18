import { z } from 'zod'
import {
  createPaginationSchema,
  numericIdParamSchema,
} from '../../shared/schemas'

export const productImageSchema = z.object({
  imageId: z.number(),
  productId: z.number().nullable(),
  variantId: z.number().nullable(),
  url: z.string(),
  altText: z.string().nullable(),
  isPrimary: z.boolean(),
  sortOrder: z.number(),
  metadata: z.any().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

const PRODUCT_IMAGE_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'sortOrder',
] as const

export const listProductImagesQuerySchema = createPaginationSchema(
  PRODUCT_IMAGE_SORT_FIELDS as unknown as string[],
)
export const productImageIdParamSchema = numericIdParamSchema

export const createProductImageBodySchema = z.object({
  productId: z.number().int().optional(),
  variantId: z.number().int().optional(),
  url: z.string().optional(),
  altText: z.string().optional(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  metadata: z.any().optional(),
})

export type ProductImage = z.infer<typeof productImageSchema>
export type ListProductImagesQuery = z.infer<
  typeof listProductImagesQuerySchema
>
export type CreateProductImageBody = z.infer<
  typeof createProductImageBodySchema
>
export type ProductImageIdParam = z.infer<typeof productImageIdParamSchema>
