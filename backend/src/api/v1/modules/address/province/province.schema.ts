import { z } from 'zod'
import {
  createPaginationSchema,
  numericIdParamSchema,
} from '../../../shared/schemas'


const wardSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  nameEn: z.string().nullable(),
  type: z.string().optional(),   
  slug: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})


export const provinceSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  nameEn: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  wards: z.array(wardSchema).optional(),
})

const PROVINCE_SORT_FIELDS = ['name', 'code', 'createdAt', 'updatedAt'] as const


export const listProvincesQuerySchema = createPaginationSchema(
  PROVINCE_SORT_FIELDS as unknown as string[],
).extend({
  name: z.string().optional(),
  code: z.string().optional(),
  search: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim() : undefined)),
})

export const provinceIdParamSchema = numericIdParamSchema

export const provinceCodeParamSchema = z.object({
  code: z.string().length(2, 'Province code must be exactly 2 characters (e.g., 01, 79)'),
})

export type Province = z.infer<typeof provinceSchema>

export type ListProvincesQuery = z.infer<typeof listProvincesQuerySchema>
export type ProvinceIdParam = z.infer<typeof provinceIdParamSchema>
export type ProvinceCodeParam = z.infer<typeof provinceCodeParamSchema>