import { z } from 'zod'
import {
  numericIdParamSchema,
  createPaginationSchema,
} from '../../shared/schemas'
import { create } from 'domain'

export const attributeSchema = z.object({
  id: z.number(),
  name: z.string().min(2).max(150),
  inputType: z.string().min(1).max(50).trim(),
  isFilterable: z.boolean(),
  isSearchable: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const attributeDtoSchema = attributeSchema

export const attributeIdParamSchema = numericIdParamSchema

export const createAttributeBodySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(150, 'Name must be at most 150 characters')
    .trim(),
  inputType: z.string().min(1).max(50).trim(),
  isFilterable: z.boolean().default(false),
  isSearchable: z.boolean().default(false),
})

export const updateAttributeBodySchema = z.object({
  name: z.string().min(2).max(150).trim().optional(),
  inputType: z.string().min(1).max(50).trim().optional(),
  isFilterable: z.boolean().optional(),
  isSearchable: z.boolean().optional(),
  deletedAt: z.date().optional(),
})

const ATTRIBUTE_SORT_FIELDS = ['createdAt', 'updatedAt', 'name'] as const

export const listAttributesQuerySchema = createPaginationSchema(
  ATTRIBUTE_SORT_FIELDS as unknown as string[],
).extend({
  isFilterable: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),

  isSearchable: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),

  inputType: z.string().optional(),
})

export type ListAttributesQuery = z.infer<typeof listAttributesQuerySchema>

export type Attribute = z.infer<typeof attributeSchema>

export type AttributeDto = z.infer<typeof attributeDtoSchema>

export type AttributeIdParam = z.infer<typeof attributeIdParamSchema>

export type CreateAttributeBody = z.infer<typeof createAttributeBodySchema>

export type UpdateAttributeBody = z.infer<typeof updateAttributeBodySchema>
