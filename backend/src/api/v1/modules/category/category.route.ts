import { Router } from 'express'
import {
  authenticate,
  requireAdmin,
} from '../../shared/middlewares/auth.middleware'
import {
  validate,
  validateMultiple,
} from '../../shared/middlewares/validate.middleware'
import categoryController from './category.controller'
import {
  categoryIdParamSchema,
  categorySlugParamSchema,
  createCategoryBodySchema,
  listCategoriesQuerySchema,
  updateCategoryBodySchema,
} from './category.schema'

const router = Router()

router.get(
  '/',
  validate(listCategoriesQuerySchema, 'query'),
  categoryController.findAll,
)

router.get(
  '/slug/:slug',
  validate(categorySlugParamSchema, 'params'),
  categoryController.findBySlug,
)

router.get(
  '/:id',
  validate(categoryIdParamSchema, 'params'),
  categoryController.findById,
)

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createCategoryBodySchema, 'body'),
  categoryController.create,
)

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateMultiple({
    params: categoryIdParamSchema,
    body: updateCategoryBodySchema,
  }),
  categoryController.updateById,
)

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(categoryIdParamSchema, 'params'),
  categoryController.deleteById,
)

router.delete(
  '/:id/soft',
  authenticate,
  requireAdmin,
  validate(categoryIdParamSchema, 'params'),
  categoryController.softDeleteById,
)

router.post(
  '/:id/restore',
  authenticate,
  requireAdmin,
  validate(categoryIdParamSchema, 'params'),
  categoryController.restoreById,
)

export default router
