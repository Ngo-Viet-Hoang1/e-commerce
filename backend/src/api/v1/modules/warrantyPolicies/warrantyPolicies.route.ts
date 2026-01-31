import { Router } from 'express'
import {
  authenticate,
  requireAdmin,
} from '../../shared/middlewares/auth.middleware'
import {
  validate,
  validateMultiple,
} from '../../shared/middlewares/validate.middleware'
import WarrantyPoliciesController from './warrantyPolicies.controller'
import {
  createWarrantyPolicyBodySchema,
  listWarrantyPoliciesQuerySchema,
  updateWarrantyPolicyBodySchema,
  warrantyPolicyIdParamSchema,
} from './warrantyPolicies.shema'

const router = Router()

router.get(
  '/:productId/warranty-policies',
  validate(listWarrantyPoliciesQuerySchema, 'query'),
  WarrantyPoliciesController.findAll,
)

router.get(
  '/:productId/warranty-policies/:id',
  validate(warrantyPolicyIdParamSchema, 'params'),
  WarrantyPoliciesController.findById,
)

router.post(
  '/:productId/warranty-policies',
  authenticate,
  requireAdmin,
  validate(createWarrantyPolicyBodySchema, 'body'),
  WarrantyPoliciesController.create,
)

router.put(
  '/:productId/warranty-policies/:id',
  authenticate,
  requireAdmin,
  validateMultiple({
    params: createWarrantyPolicyBodySchema,
    body: updateWarrantyPolicyBodySchema,
  }),
  WarrantyPoliciesController.updateById,
)

router.delete(
  '/:productId/warranty-policies/:id',
  authenticate,
  requireAdmin,
  validate(warrantyPolicyIdParamSchema, 'params'),
  WarrantyPoliciesController.deleteById,
)

router.delete(
  '/:productId/warranty-policies/:id/soft',
  authenticate,
  requireAdmin,
  validate(warrantyPolicyIdParamSchema, 'params'),
  WarrantyPoliciesController.softDeleteById,
)

router.post(
  '/:productId/warranty-policies/:id/restore',
  authenticate,
  requireAdmin,
  validate(warrantyPolicyIdParamSchema, 'params'),
  WarrantyPoliciesController.restoreById,
)

export default router
