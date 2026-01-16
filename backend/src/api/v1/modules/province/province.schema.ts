import { z } from 'zod'
import { createPaginationSchema } from '../../shared/schemas'

export const provinceSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  nameEn: z.string().nullable(),
  fullName: z.string().nullable(),
  fullNameEn: z.string().nullable(),
  codeName: z.string().nullable(),
  administrativeUnitId: z.number().nullable(),
  administrativeUnitShortName: z.string().nullable(),
  administrativeUnitFullName: z.string().nullable(),
  administrativeUnitFullNameEn: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const provinceDtoSchema = provinceSchema

const PROVINCE_SORT_FIELDS = ['code', 'name', 'createdAt'] as const

export const listProvincesQuerySchema = createPaginationSchema(
  PROVINCE_SORT_FIELDS as unknown as string[],
).extend({
  search: z.string().optional(),
})

export const getProvinceByCodeParamSchema = z.object({
  code: z.string(),
})

export type ListProvincesQuery = z.infer<typeof listProvincesQuerySchema>
export type GetProvinceByCodeParam = z.infer<
  typeof getProvinceByCodeParamSchema
>
