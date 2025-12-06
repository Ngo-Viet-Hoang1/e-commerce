import { z } from 'zod'
import {
  PAGINATION_DEFAULTS,
  SORT_ORDER,
} from '../constants/pagination.constant.js'

export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : PAGINATION_DEFAULTS.PAGE))
    .pipe(z.number().int().min(1, 'Page must be at least 1'))
    .catch(PAGINATION_DEFAULTS.PAGE),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : PAGINATION_DEFAULTS.LIMIT))
    .pipe(
      z
        .number()
        .int()
        .min(
          PAGINATION_DEFAULTS.MIN_LIMIT,
          `Limit must be at least ${PAGINATION_DEFAULTS.MIN_LIMIT}`,
        )
        .max(
          PAGINATION_DEFAULTS.MAX_LIMIT,
          `Limit must be at most ${PAGINATION_DEFAULTS.MAX_LIMIT}`,
        ),
    )
    .catch(PAGINATION_DEFAULTS.LIMIT),

  sort: z.string().optional().default('createdAt'),

  order: z
    .enum([SORT_ORDER.ASC, SORT_ORDER.DESC])
    .optional()
    .default(SORT_ORDER.DESC)
    .catch(SORT_ORDER.DESC),

  search: z.string().max(255, 'Search term too long').optional(),

  filters: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Create a pagination schema with allowed sort fields validation
 */
export function createPaginationSchema(allowedSortFields: string[]) {
  return paginationQuerySchema.extend({
    sort: z
      .string()
      .optional()
      .refine((val) => !val || allowedSortFields.includes(val), {
        message: `Sort field must be one of: ${allowedSortFields.join(', ')}`,
      })
      .default('createdAt'),
  })
}

/**
 * Advanced pagination with multi-field sorting
 */
export const advancedPaginationQuerySchema = paginationQuerySchema.extend({
  sortOptions: z
    .record(z.string(), z.enum([SORT_ORDER.ASC, SORT_ORDER.DESC]))
    .optional()
    .refine((val) => !val || Object.keys(val).length <= 3, {
      message: 'Maximum 3 sort fields allowed',
    }),
})

/**
 * Type-safe pagination params
 */
export type PaginationQuery = z.infer<typeof paginationQuerySchema>
export type AdvancedPaginationQuery = z.infer<
  typeof advancedPaginationQuerySchema
>
