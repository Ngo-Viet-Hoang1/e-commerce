import authAdminRoute from '@v1/modules/auth/routes/auth.admin.route'
import dashboardRoute from '@v1/modules/dashboard/dashboard.route'
import { Router } from 'express'

const router = Router()

router.use('/auth', authAdminRoute)
router.use('/dashboard', dashboardRoute)

export default router
