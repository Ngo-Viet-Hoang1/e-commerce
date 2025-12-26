import { z } from 'zod'
import {
  createPaginationSchema,
  numericIdParamSchema,
} from '../../shared/schemas'

const PRODUCT_SPECIFICATION_SORT_FIELDS = [
  'createdAt',
  'key',
  'displayOrder',
] as const

const specificationItemSchema = z.object({
  id: z.number(),
  productId: z.number(),
  key: z.string(),
  value: z.string(),
  displayOrder: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const productSpecificationSchema = z.array(specificationItemSchema)

export const listProductSpecificationsQuerySchema = createPaginationSchema(
  PRODUCT_SPECIFICATION_SORT_FIELDS as unknown as string[],
)

export const productSpecificationIdParamSchema = numericIdParamSchema

export const getByProductIdParamSchema = z.object({
  productId: z.coerce.number().int().positive('Invalid product ID'),
})

export const createProductSpecificationBodySchema = z.object({
  productId: z.number().int().positive('Invalid product ID'),
  key: z.string().min(1, 'Key is required').max(255, 'Key too long'),
  value: z.string().max(1000, 'Value too long').optional(),
  displayOrder: z.number().int().min(0).optional(),
})

export const updateProductSpecificationBodySchema = z.object({
  key: z.string().min(1, 'Key is required').max(255, 'Key too long').optional(),
  value: z.string().max(1000, 'Value too long').optional(),
  displayOrder: z.number().int().min(0).optional(),
})

const createMultipleItemSchema = z.object({
  key: z.string().min(1, 'Key is required').max(255, 'Key too long'),
  value: z.string().max(1000, 'Value too long').optional(),
  displayOrder: z.number().int().min(0).optional(),
})

export const createMultipleByProductIdBodySchema = z
  .array(createMultipleItemSchema)
  .min(1, 'At least one specification is required')
  .max(100, 'Maximum 100 specifications allowed per request')

export type ProductSpecification = z.infer<
  typeof productSpecificationSchema
>

export type ListProductSpecificationsQuery = z.infer<
  typeof listProductSpecificationsQuerySchema
>

export type ProductSpecificationIdParam = z.infer<
  typeof productSpecificationIdParamSchema
>

export type GetByProductIdParam = z.infer<typeof getByProductIdParamSchema>

export type CreateProductSpecificationBody = z.infer<
  typeof createProductSpecificationBodySchema
>

export type UpdateProductSpecificationBody = z.infer<
  typeof updateProductSpecificationBodySchema
>

export type CreateMultipleByProductIdBody = z.infer<
  typeof createMultipleByProductIdBodySchema
>
