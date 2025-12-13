import { Router } from 'express'
import authRoute from '../modules/auth/auth.route.js'
import categoryRoute from '../modules/category/category.route.js'
import userRoute from '../modules/user/user.route.js'
import errorRoute from './error.route.js'
import homeRoute from './home.route.js'
import brandRoute from '../modules/brand/brand.route.js'
import productRoute from '../modules/product/product.route.js'

const router = Router()

router.use('/', homeRoute)
router.use('/auth', authRoute)
router.use('/users', userRoute)
router.use('/brands', brandRoute)
router.use('/categories', categoryRoute)
router.use('/products', productRoute)
router.use('/errors', errorRoute)

export default router
