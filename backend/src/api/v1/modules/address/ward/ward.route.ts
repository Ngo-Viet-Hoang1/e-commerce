import { Router } from 'express'
import { validate } from '../../../shared/middlewares/validate.middleware'
import { wardController } from './ward.controller'
import {
  listWardsQuerySchema,
  wardIdParamSchema,
  wardCodeParamSchema,
  provinceCodeParamSchema
} from './ward.schema'

const router = Router()

router.get(
  '/',
  validate(listWardsQuerySchema, 'query'),
  wardController.findAll,
)

router.get(
  '/province/:provinceCode',
  validate(provinceCodeParamSchema, 'params'),
  wardController.findByProvinceCode
)

router.get(
  '/:id',
  validate(wardIdParamSchema, 'params'),
  wardController.findById,
)

router.get(
  '/code/:code',
  validate(wardCodeParamSchema, 'params'),
  wardController.findByCode,
)

export default router