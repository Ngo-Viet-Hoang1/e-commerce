
import { Router } from 'express'
import { validate } from '../../../shared/middlewares/validate.middleware'
import { provinceController } from './provincecontroller'
import {
  listProvincesQuerySchema,
  provinceIdParamSchema,
  provinceCodeParamSchema,
} from './province.schema'

const router = Router()

router.get(
  '/',
  validate(listProvincesQuerySchema, 'query'),
  provinceController.findAll,
)
router.get('/all', provinceController.getAll)

router.get(
  '/:id',
  validate(provinceIdParamSchema, 'params'),
  provinceController.findById,
)

router.get(
  '/code/:code',
  validate(provinceCodeParamSchema, 'params'),
  provinceController.findByCode,
)

export default router