import { z } from 'zod'
import {
  createPaginationSchema,
  numericIdParamSchema,
} from '../../../shared/schemas'

const provinceShortSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  fullName: z.string().nullable(),
  codeName: z.string().nullable(),
})

export const wardSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  nameEn: z.string().nullable(),
  fullName: z.string().nullable(),
  fullNameEn: z.string().nullable(),
  codeName: z.string().nullable(),
  provinceCode: z.string(),
  administrativeUnitId: z.number().nullable(),
  administrativeUnitShortName: z.string().nullable(),
  administrativeUnitFullName: z.string().nullable(),
  administrativeUnitShortNameEn: z.string().nullable(),
  administrativeUnitFullNameEn: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  province: provinceShortSchema.optional(), 
})

const WARD_SORT_FIELDS = ['name', 'code', 'fullName', 'createdAt', 'updatedAt'] as const

export const listWardsQuerySchema = createPaginationSchema(
  WARD_SORT_FIELDS as unknown as string[],
).extend({
  provinceCode: z.string().optional(),
  name: z.string().optional(),
  search: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim() : undefined)),
})

export const wardIdParamSchema = numericIdParamSchema

export const wardCodeParamSchema = z.object({
  code: z
    .string()
    .min(5, 'Ward code must be at least 5 characters (e.g., 00004)')
    .regex(/^\d+$/, 'Ward code must contain only digits'),
})

export const provinceCodeParamSchema = z.object({
  provinceCode: z
    .string()
    .length(2, 'Province code must be exactly 2 characters (e.g., 01, 79)')
    .regex(/^\d{2}$/, 'Province code must be 2 digits'),
})

export type Ward = z.infer<typeof wardSchema>
export type ListWardsQuery = z.infer<typeof listWardsQuerySchema>
export type WardIdParam = z.infer<typeof wardIdParamSchema>
export type WardCodeParam = z.infer<typeof wardCodeParamSchema>
export type ProvinceCodeParam = z.infer<typeof provinceCodeParamSchema>