import { z } from 'zod'
import {
  numericIdParamSchema,
  createPaginationSchema,
} from '../../shared/schemas'

export const addressSchema = z.object({
  id: z.number(),
  userId: z.number(),
  districtCode: z.string(),
  provinceCode: z.string(),
  detail: z.string().nullable(),
  isDefault: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const addressDtoSchema = addressSchema

export const addressIdParamSchema = numericIdParamSchema

export const createAddressBodySchema = z.object({
  districtCode: z.string().min(1),
  provinceCode: z.string().min(1),
  detail: z.string().max(255).optional(),
  isDefault: z.boolean().default(false),
})

export const updateAddressBodySchema = z.object({
  districtCode: z.string().min(1).optional(),
  provinceCode: z.string().min(1).optional(),
  detail: z.string().max(255).optional(),
  isDefault: z.boolean().optional(),
})

const ADDRESS_SORT_FIELDS = ['createdAt', 'updatedAt'] as const

export const listAddressesQuerySchema = createPaginationSchema(
  ADDRESS_SORT_FIELDS as unknown as string[],
).extend({
  isDefault: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
})

export type Address = z.infer<typeof addressSchema>
export type AddressDto = z.infer<typeof addressDtoSchema>

export type AddressIdParam = z.infer<typeof addressIdParamSchema>

export type CreateAddressBody = z.infer<typeof createAddressBodySchema>
export type UpdateAddressBody = z.infer<typeof updateAddressBodySchema>

export type ListAddressesQuery = z.infer<typeof listAddressesQuerySchema>
