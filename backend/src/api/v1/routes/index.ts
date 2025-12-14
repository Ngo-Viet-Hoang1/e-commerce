import { Router } from 'express'
import authRoute from '../modules/auth/auth.route.js'
import categoryRoute from '../modules/category/category.route.js'
import userRoute from '../modules/user/user.route.js'
import errorRoute from './error.route.js'
import homeRoute from './home.route.js'
import orderRouter from '../modules/order/order.route'
import attributeRoute from '../modules/attributes/attribute.route'
import attributeValueRoute from '../modules/attributeValue/attributeValue.route'
import brandRoute from '../modules/brand/brand.route.js'
import badgeRoute from '../modules/badge/badge.route.js'
import productRoute from '../modules/product/product.route.js'
import warrantyPoliciesRoute from '../modules/warrantyPolicies/warrantyPolicies.route.js'

const router = Router()

router.use('/', homeRoute)
router.use('/auth', authRoute)
router.use('/users', userRoute)
router.use('/brands', brandRoute)
router.use('/categories', categoryRoute)
router.use('/badges', badgeRoute)
router.use('/products', productRoute)
router.use('/errors', errorRoute)
router.use('/orders', orderRouter)
router.use('/attributes', attributeRoute)
router.use('/attributes', attributeValueRoute)
router.use('/warranty-policies', warrantyPoliciesRoute)
router.use('/products', warrantyPoliciesRoute)

export default router
