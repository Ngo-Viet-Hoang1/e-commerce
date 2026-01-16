import { z } from 'zod'
import {
  createPaginationSchema,
  numericIdParamSchema,
} from '../../shared/schemas'

export const productVideoSchema = z.object({
  videoId: z.number(),
  productId: z.number().nullable(),
  variantId: z.number().nullable(),
  title: z.string(),
  provider: z.string(),
  url: z.string(),
  thumbnailUrl: z.string(),
  durationSeconds: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

const PRODUCT_VIDEO_SORT_FIELDS = ['createdAt', 'updatedAt'] as const

export const listProductVideosQuerySchema = createPaginationSchema(
  PRODUCT_VIDEO_SORT_FIELDS as unknown as string[],
)
export const productVideoIdParamSchema = numericIdParamSchema

export const createProductVideoBodySchema = z.object({
  productId: z.number().int().optional(),
  variantId: z.number().int().optional(),
  title: z.string().optional(),
  provider: z.string().optional(),
  url: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  durationSeconds: z.number().int().optional(),
})

export type ProductVideo = z.infer<typeof productVideoSchema>
export type ListProductVideosQuery = z.infer<
  typeof listProductVideosQuerySchema
>
export type CreateProductVideoBody = z.infer<
  typeof createProductVideoBodySchema
>
export type ProductVideoIdParam = z.infer<typeof productVideoIdParamSchema>
