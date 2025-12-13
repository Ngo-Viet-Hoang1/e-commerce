import { z } from 'zod'
import {
  createPaginationSchema,
  numericIdParamSchema,
} from '../../shared/schemas'

export const brandSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  logoUrl: z.string().nullable(),
  website: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const brandDtoSchema = brandSchema

const BRAND_SORT_FIELDS = ['createdAt', 'name'] as const

export const listBrandsQuerySchema = createPaginationSchema(
  BRAND_SORT_FIELDS as unknown as string[],
)

export const brandIdParamSchema = numericIdParamSchema

export const createBrandBodySchema = z.object({
  name: z
    .string()
    .min(1, 'Name must be at least 1 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .trim()
    .optional(),
  logoUrl: z.string().url('Logo URL must be a valid URL').optional(),
  website: z.string().url('Website must be a valid URL').optional(),
})

export const updateBrandBodySchema = z.object({
  name: z
    .string()
    .min(1, 'Name must be at least 1 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .trim()
    .optional(),
  logoUrl: z.string().optional(),
  website: z.string().optional(),
})

export type BrandCreate = z.infer<typeof createBrandBodySchema>
export type BrandUpdate = z.infer<typeof updateBrandBodySchema>
export type BrandListQuery = z.infer<typeof listBrandsQuerySchema>
export type BrandIdParam = z.infer<typeof brandIdParamSchema>
