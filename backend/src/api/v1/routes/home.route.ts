import { homeController } from '@/api/v1/modules/home/home.controller'
import { Router } from 'express'

const router = Router()

router.get('/', homeController.index)

export default router
