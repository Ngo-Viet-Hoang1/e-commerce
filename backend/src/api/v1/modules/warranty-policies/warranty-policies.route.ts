import { Router } from 'express'
import {
  authenticate,
  requireAdmin,
} from '../../shared/middlewares/auth.middleware'
import {
  validate,
  validateMultiple,
} from '../../shared/middlewares/validate.middleware'
import warrantyPoliciesController from './warranty-policies.controller'
import {
  createWarrantyPolicyBodySchema,
  listWarrantyPoliciesQuerySchema,
  updateWarrantyPolicyBodySchema,
  warrantyPolicyIdParamSchema,
} from './warranty-policies.schema'

const router = Router()

router.get(
  '/',
  validate(listWarrantyPoliciesQuerySchema, 'query'),
  warrantyPoliciesController.findAll,
)

router.get(
  '/:id',
  validate(warrantyPolicyIdParamSchema, 'params'),
  warrantyPoliciesController.findById,
)

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createWarrantyPolicyBodySchema, 'body'),
  warrantyPoliciesController.create,
)

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateMultiple({
    params: warrantyPolicyIdParamSchema,
    body: updateWarrantyPolicyBodySchema,
  }),
  warrantyPoliciesController.updateById,
)

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(warrantyPolicyIdParamSchema, 'params'),
  warrantyPoliciesController.deleteById,
)

router.delete(
  '/:id/soft',
  authenticate,
  requireAdmin,
  validate(warrantyPolicyIdParamSchema, 'params'),
  warrantyPoliciesController.softDeleteById,
)

router.post(
  '/:id/restore',
  authenticate,
  requireAdmin,
  validate(warrantyPolicyIdParamSchema, 'params'),
  warrantyPoliciesController.restoreById,
)

export default router
