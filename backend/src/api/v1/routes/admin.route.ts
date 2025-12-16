import authAdminRoute from '@v1/modules/auth/routes/auth.admin.route'
import { Router } from 'express'

const router = Router()

router.use('/auth', authAdminRoute)

export default router
