import { Router } from 'express'
import errorRoute from './error.route.js'
import homeRoute from './home.route.js'

const router = Router()

router.use('/', homeRoute)
router.use('/errors', errorRoute)

export default router
