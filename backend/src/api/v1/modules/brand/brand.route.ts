import { Router } from 'express'
import {
  authenticate,
  requireAdmin,
} from '../../shared/middlewares/auth.middleware'
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
  authenticate,
  requireAdmin,
  validate(createBrandBodySchema, 'body'),
  brandController.create,
)

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateMultiple({
    params: brandIdParamSchema,
    body: updateBrandBodySchema,
  }),
  brandController.updateById,
)

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(brandIdParamSchema, 'params'),
  brandController.deleteById,
)

router.delete(
  '/:id/soft',
  authenticate,
  requireAdmin,
  validate(brandIdParamSchema, 'params'),
  brandController.softDeleteById,
)

router.post(
  '/:id/restore',
  authenticate,
  requireAdmin,
  validate(brandIdParamSchema, 'params'),
  brandController.restoreById,
)

export default router
