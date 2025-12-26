import { z } from 'zod'
import { createPaginationSchema } from '../../shared/schemas'

export const productBadgeSchema = z.object({
  productId: z.number(),
  badgeId: z.number(),
  awardedAt: z.date(),
  awardedBy: z.number().nullable(),
  deletedAt: z.date().nullable(),
})

const PRODUCT_BADGE_SORT_FIELDS = ['awardedAt', 'awardedBy'] as const

export const listProductBadgesQuerySchema = createPaginationSchema(
  PRODUCT_BADGE_SORT_FIELDS as unknown as string[],
).extend({
  sort: z.enum(PRODUCT_BADGE_SORT_FIELDS).default('awardedAt'),
})

export const productBadgeParamSchema = z.object({
  productId: z.coerce.number(),
  badgeId: z.coerce.number(),
})

export const createProductBadgeBodySchema = z.object({
  productId: z.coerce.number(),
  badgeId: z.coerce.number(),
  awardedBy: z.number().optional(),
})

export const updateProductBadgeBodySchema = z.object({
  productId: z.coerce.number(),
  badgeId: z.coerce.number(),
  awardedBy: z.number().nullable().optional(),
})

export type ProductBadge = z.infer<typeof productBadgeSchema>
export type ProductBadgeCreate = z.infer<typeof createProductBadgeBodySchema>
export type ProductBadgeUpdate = z.infer<typeof updateProductBadgeBodySchema>
export type ListProductBadgesQuery = z.infer<
  typeof listProductBadgesQuerySchema
>
export type ProductBadgeParam = z.infer<typeof productBadgeParamSchema>
