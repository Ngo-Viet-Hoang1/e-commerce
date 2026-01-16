import { Router } from 'express'
import { validate } from '../../shared/middlewares/validate.middleware'
import { provinceController } from './province.controller'
import {
  getProvinceByCodeParamSchema,
  listProvincesQuerySchema,
} from './province.schema'

const router = Router()

router.get(
  '/',
  validate(listProvincesQuerySchema, 'query'),
  provinceController.findAll,
)

router.get(
  '/:code',
  validate(getProvinceByCodeParamSchema, 'params'),
  provinceController.findByCode,
)

export default router
