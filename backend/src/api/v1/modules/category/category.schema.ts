import { z } from 'zod'
import {
  createPaginationSchema,
  numericIdParamSchema,
} from '../../shared/schemas'

export const categorySchema = z.object({
  id: z.number(),
  parentId: z.number().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

const CATEGORY_SORT_FIELDS = ['createdAt', 'name', 'slug'] as const

export const listCategoriesQuerySchema = createPaginationSchema(
  CATEGORY_SORT_FIELDS as unknown as string[],
)

export const categoryIdParamSchema = numericIdParamSchema

export const createCategoryBodySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be at most 255 characters')
    .trim()
    .optional(),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(255, 'Slug must be at most 255 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .trim()
    .optional(),
  parentId: z.number().nullable().optional(),
})

export const updateCategoryBodySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be at most 255 characters')
    .trim()
    .optional(),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(255, 'Slug must be at most 255 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .trim()
    .optional(),
  parentId: z.number().nullable().optional(),
})

export const categorySlugParamSchema = z.object({
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(255, 'Slug must be at most 255 characters')
    .trim(),
})

export type Category = z.infer<typeof categorySchema>

export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>
export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>
export type CreateCategoryBody = z.infer<typeof createCategoryBodySchema>
export type UpdateCategoryBody = z.infer<typeof updateCategoryBodySchema>
export type CategorySlugParam = z.infer<typeof categorySlugParamSchema>
