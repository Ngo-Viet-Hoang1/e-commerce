export { default as provinceRouter } from './province.route'
export { provinceController } from './provincecontroller'
export { provinceService } from './province.service'
export { provinceRepository } from './province.repository'

export type {
  Province,
  ListProvincesQuery,
  ProvinceIdParam,
  ProvinceCodeParam,
} from './province.schema'

export {
  provinceSchema,
  listProvincesQuerySchema,
  provinceIdParamSchema,
  provinceCodeParamSchema,
} from './province.schema'
