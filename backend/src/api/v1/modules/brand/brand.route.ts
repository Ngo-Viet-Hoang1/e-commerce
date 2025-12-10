import { Router } from 'express'
import {
  validate,
  validateMultiple,
} from '../../shared/middlewares/validate.middleware'
import { brandController } from './brand.controller'

import {
  brandIdParamSchema,
  createBrandBodySchema,
  listBrandsQuerySchema,
  updateBrandBodySchema,
} from './brand.schema'
const router = Router()

router.get(
  '/',
  validate(listBrandsQuerySchema, 'query'),
  brandController.findAll,
)

router.get(
  '/:id',
  validate(brandIdParamSchema, 'params'),
  brandController.findById,
)

router.post(
  '/',
  validate(createBrandBodySchema, 'body'),
  brandController.create,
)

router.put(
  '/:id',
  validateMultiple({
    params: brandIdParamSchema,
    body: updateBrandBodySchema,
  }),
  brandController.updateById,
)

router.delete(
  '/:id',
  validate(brandIdParamSchema, 'params'),
  brandController.deleteById,
)

router.delete(
  '/:id/soft',
  validate(brandIdParamSchema, 'params'),
  brandController.softDeleteById,
)

router.post(
  '/:id/restore',
  validate(brandIdParamSchema, 'params'),
  brandController.restoreById,
)

export default router
