import { Router } from 'express'
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
  '/:id',
  validate(categoryIdParamSchema, 'params'),
  categoryController.findById,
)

router.get(
  '/slug/:slug',
  validate(categorySlugParamSchema, 'params'),
  categoryController.findBySlug,
)

router.post(
  '/',
  validate(createCategoryBodySchema, 'body'),
  categoryController.create,
)

router.put(
  '/:id',
  validateMultiple({
    params: categoryIdParamSchema,
    body: updateCategoryBodySchema,
  }),
  categoryController.updateById,
)

router.delete(
  '/:id',
  validate(categoryIdParamSchema, 'params'),
  categoryController.deleteById,
)

router.delete(
  '/:id/soft',
  validate(categoryIdParamSchema, 'params'),
  categoryController.softDeleteById,
)

router.post(
  '/:id/restore',
  validate(categoryIdParamSchema, 'params'),
  categoryController.restoreById,
)

export default router
