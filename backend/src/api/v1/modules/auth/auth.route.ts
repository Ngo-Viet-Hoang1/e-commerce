import { Router } from 'express'
import { validate } from '../../shared/schemas'
import { createUserBodySchema } from '../user'
import { authController } from './auth.controller'

const router = Router()

router.post(
  '/register',
  validate(createUserBodySchema, 'body'),
  authController.register,
)

export default router
