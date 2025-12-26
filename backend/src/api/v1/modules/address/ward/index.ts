// backend/src/api/v1/modules/address/ward/index.ts

export { default as wardRouter } from './ward.route'
export { wardController } from './ward.controller'
export { wardService } from './ward.service'
export { wardRepository } from './ward.repository'

export type {
  Ward,
  ListWardsQuery,
  WardIdParam,
  WardCodeParam,
} from './ward.schema'

export {
  wardSchema,
  listWardsQuerySchema,
  wardIdParamSchema,
  wardCodeParamSchema,
} from './ward.schema'