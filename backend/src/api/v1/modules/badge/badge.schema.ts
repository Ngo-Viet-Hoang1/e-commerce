import { z } from 'zod'
import {
  createPaginationSchema,
  numericIdParamSchema,
} from '../../shared/schemas'

export const badgeSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  iconUrl: z.string().nullable(),
  criteria: z.json().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

const BADGE_SORT_FIELDS = ['createdAt', 'name'] as const

export const listBadgesQuerySchema = createPaginationSchema(
  BADGE_SORT_FIELDS as unknown as string[],
)

export const badgeIdParamSchema = numericIdParamSchema

export const createBadgeBodySchema = z.object({
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(100, 'Code must be at most 100 characters')
    .trim(),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be at most 255 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .trim(),
  iconUrl: z.string().nullable().optional(),
  criteria: z.json().optional().nullable(),
})

export const updateBadgeBodySchema = z.object({
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(100, 'Code must be at most 100 characters')
    .trim()
    .optional(),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be at most 255 characters')
    .trim()
    .optional(),
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(255, 'Title must be at most 255 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .trim()
    .optional(),
  iconUrl: z.string().nullable().optional(),
  criteria: z.json().optional().nullable(),
})

export type Badge = z.infer<typeof badgeSchema>

export type BadgeCreate = z.infer<typeof createBadgeBodySchema>
export type BadgeUpdate = z.infer<typeof updateBadgeBodySchema>
export type BadgeListQuery = z.infer<typeof listBadgesQuerySchema>
export type BadgeIdParam = z.infer<typeof badgeIdParamSchema>
