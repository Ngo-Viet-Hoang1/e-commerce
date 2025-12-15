import { Prisma } from '@generated/prisma/client'
import { z } from 'zod'
import {
  createPaginationSchema,
  numericIdParamSchema,
} from '../../shared/schemas'

const decimalToNumber = z.union([
  z.number(),
  z.instanceof(Prisma.Decimal).transform((v) => v.toNumber()),
])

export const productVariantSchema = z.object({
  id: z.number(),
  productId: z.number(),

  sku: z.string(),
  title: z.string().nullable(),
  barcode: z.string().nullable(),

  price: decimalToNumber,
  costPrice: decimalToNumber.nullable(),
  msrp: decimalToNumber.nullable(),

  stockQuantity: z.number(),
  backorderable: z.boolean(),
  isDefault: z.boolean(),

  metadata: z.json().optional().nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const productVariantDtoSchema = productVariantSchema

const PRODUCT_VARIANT_SORT_FIELDS = [
  'createdAt',
  'price',
  'sku',
  'stockQuantity',
] as const

export const listProductVariantsQuerySchema = createPaginationSchema(
  PRODUCT_VARIANT_SORT_FIELDS as unknown as string[],
).extend({
  productId: z.coerce.number().int().positive().optional(),

  isDefault: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),

  backorderable: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
})

export const productVariantIdParamSchema = numericIdParamSchema

export const createProductVariantBodySchema = z.object({
  productId: z.number().int().positive(),

  sku: z.string().min(1).max(100),
  title: z.string().max(255).optional(),
  barcode: z.string().max(100).optional(),

  price: z.coerce.number().positive(),
  costPrice: z.coerce.number().nonnegative().optional(),
  msrp: z.coerce.number().nonnegative().optional(),

  stockQuantity: z.number().int().min(0).default(0),
  backorderable: z.boolean().default(false),
  isDefault: z.boolean().default(false),

  metadata: z.json().optional().nullable(),

  attributeValueIds: z.array(z.number().int().positive()).min(1),
})

export const updateProductVariantBodySchema = z.object({
  sku: z.string().min(1).max(100).optional(),
  title: z.string().max(255).optional(),
  barcode: z.string().max(100).optional(),

  price: z.coerce.number().positive().optional(),
  costPrice: z.coerce.number().nonnegative().optional(),
  msrp: z.coerce.number().nonnegative().optional(),

  stockQuantity: z.number().int().min(0).optional(),
  backorderable: z.boolean().optional(),
  isDefault: z.boolean().optional(),

  metadata: z.json().optional().nullable(),

  attributeValueIds: z.array(z.number().int().positive()).min(1).optional(),
})

export type ProductVariant = z.infer<typeof productVariantSchema>
export type ProductVariantDto = z.infer<typeof productVariantDtoSchema>

export type ListProductVariantsQuery = z.infer<
  typeof listProductVariantsQuerySchema
>

export type ProductVariantIdParam = z.infer<typeof productVariantIdParamSchema>

export type CreateProductVariantBody = z.infer<
  typeof createProductVariantBodySchema
>

export type UpdateProductVariantBody = z.infer<
  typeof updateProductVariantBodySchema
>
