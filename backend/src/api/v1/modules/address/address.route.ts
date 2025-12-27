import { Router } from 'express'
import { addressController } from './address.controller'
import { authenticate } from '../../shared/middlewares/auth.middleware'
import { validate } from '../../shared/middlewares/validate.middleware'
import {
  addressIdParamSchema,
  createAddressBodySchema,
  updateAddressBodySchema,
  listAddressesQuerySchema,
} from './address.schema'

const router = Router()
router.use(authenticate)

router.get(
  '/',
  validate(listAddressesQuerySchema, 'query'),
  addressController.findAll,
)

router.get(
  '/:id',
  validate(addressIdParamSchema, 'params'),
  addressController.findById,
)

router.post(
  '/',
  validate(createAddressBodySchema, 'body'),
  addressController.create,
)

router.put(
  '/:id',
  validate(addressIdParamSchema, 'params'),
  validate(updateAddressBodySchema, 'body'),
  addressController.update,
)

router.delete(
  '/:id',
  validate(addressIdParamSchema, 'params'),
  addressController.deleteById,
)

router.put(
  '/:id/default',
  validate(addressIdParamSchema, 'params'),
  addressController.setDefault,
)

export default router
