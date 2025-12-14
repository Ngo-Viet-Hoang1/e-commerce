import { z } from 'zod'
import {
  numericIdParamSchema,
  createPaginationSchema,
} from '../../shared/schemas'
import { create } from 'domain'

export const attributeValueSchema = z.object({
  id: z.number(),
  attributeId: z.number(),
  valueText: z.string().min(1, 'Value must not be empty'),
  valueMetadata: z.record(z.string(), z.any()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const attributeValueIdParamSchema = numericIdParamSchema

export const createAttributeValueBodySchema = z.object({
  valueText: z.string().min(1, 'Value must not be empty'),
  valueMetadata: z.json().nullable().optional(),
})

export const updateAttributeValueBodySchema = z.object({
  valueText: z.string().min(1).optional(),
  valueMetadata: z.json().optional(),
  deletedAt: z.date().nullable().optional(),
})

const ATTRIBUTE_VALUE_SORT_FIELDS = ['createdAt', 'valueText'] as const

export const listAttributeValuesQuery = createPaginationSchema(
  ATTRIBUTE_VALUE_SORT_FIELDS as unknown as string[],
)

export type ListAttributeValuesQuery = z.infer<typeof listAttributeValuesQuery>
export type AttributeValue = z.infer<typeof attributeValueSchema>

export type AttributeValueIdParam = z.infer<typeof attributeValueIdParamSchema>

export type createAttributeValueBodySchema = z.infer<
  typeof createAttributeValueBodySchema
>

export type UpdateAttributeValueBody = z.infer<
  typeof updateAttributeValueBodySchema
>
