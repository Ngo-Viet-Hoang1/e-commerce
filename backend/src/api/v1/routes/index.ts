import { Router } from 'express'
import authRoute from '../modules/auth/auth.route.js'
import userRoute from '../modules/user/user.route.js'
import errorRoute from './error.route.js'
import homeRoute from './home.route.js'
import orderRouter from '../modules/order/order.route'
import attributeRoute from '../modules/attributes/attribute.route'
import attributeValueRoute from '../modules/attributeValue/attributeValue.route'

const router = Router()

router.use('/', homeRoute)
router.use('/auth', authRoute)
router.use('/users', userRoute)
router.use('/errors', errorRoute)
router.use('/orders', orderRouter)
router.use('/attributes', attributeRoute)
router.use('/attributes', attributeValueRoute)

export default router
