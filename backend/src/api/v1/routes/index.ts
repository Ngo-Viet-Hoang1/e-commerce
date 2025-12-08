import { Router } from 'express'
import userRoute from '../modules/user/user.route.js'
import errorRoute from './error.route.js'
import homeRoute from './home.route.js'

const router = Router()

router.use('/', homeRoute)
router.use('/users', userRoute)
router.use('/errors', errorRoute)

export default router
