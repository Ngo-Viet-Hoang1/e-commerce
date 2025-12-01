import { Router } from 'express'
import homeRoute from './home.route.js'

const router = Router()

router.use('/', homeRoute)

export default router
