import { homeController } from '@/api/v1/controllers/home.controller'
import { Router } from 'express'

const router = Router()

router.get('/', homeController.index)

export default router
