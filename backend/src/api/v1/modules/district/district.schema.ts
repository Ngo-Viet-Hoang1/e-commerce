import { z } from 'zod'
import { createPaginationSchema } from '../../shared/schemas'

export const districtSchema = z.object({
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
})

export const districtDtoSchema = districtSchema

const DISTRICT_SORT_FIELDS = ['code', 'name', 'createdAt'] as const

export const listDistrictsQuerySchema = createPaginationSchema(
  DISTRICT_SORT_FIELDS as unknown as string[],
).extend({
  search: z.string().optional(),
  provinceCode: z.string().optional(),
})

export const getDistrictByCodeParamSchema = z.object({
  code: z.string(),
})

export const getDistrictsByProvinceCodeParamSchema = z.object({
  provinceCode: z.string(),
})

export type ListDistrictsQuery = z.infer<typeof listDistrictsQuerySchema>
export type GetDistrictByCodeParam = z.infer<
  typeof getDistrictByCodeParamSchema
>
export type GetDistrictsByProvinceCodeParam = z.infer<
  typeof getDistrictsByProvinceCodeParamSchema
>
