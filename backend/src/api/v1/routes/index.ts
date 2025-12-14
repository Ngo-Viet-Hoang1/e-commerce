import { Router } from 'express'
import authRoute from '../modules/auth/auth.route.js'
import categoryRoute from '../modules/category/category.route.js'
import userRoute from '../modules/user/user.route.js'
import errorRoute from './error.route.js'
import homeRoute from './home.route.js'
import brandRoute from '../modules/brand/brand.route.js'
import badgeRoute from '../modules/badge/badge.route.js'
import productRoute from '../modules/product/product.route.js'
import productBadgeRoute from '../modules/product-badge/product-badge.route.js'

const router = Router()

router.use('/', homeRoute)
router.use('/auth', authRoute)
router.use('/users', userRoute)
router.use('/brands', brandRoute)
router.use('/categories', categoryRoute)
router.use('/badges', badgeRoute)
router.use('/products', productRoute)
router.use('/errors', errorRoute)
router.use('/product-badges', productBadgeRoute)

export default router
