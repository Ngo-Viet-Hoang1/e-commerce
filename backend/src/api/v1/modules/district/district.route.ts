import { Router } from 'express'
import { validate } from '../../shared/middlewares/validate.middleware'
import { districtController } from './district.controller'
import {
  getDistrictByCodeParamSchema,
  getDistrictsByProvinceCodeParamSchema,
  listDistrictsQuerySchema,
} from './district.schema'

const router = Router()

router.get(
  '/',
  validate(listDistrictsQuerySchema, 'query'),
  districtController.findAll,
)

router.get(
  '/province/:provinceCode',
  validate(getDistrictsByProvinceCodeParamSchema, 'params'),
  districtController.findByProvinceCode,
)

router.get(
  '/:code',
  validate(getDistrictByCodeParamSchema, 'params'),
  districtController.findByCode,
)

export default router
