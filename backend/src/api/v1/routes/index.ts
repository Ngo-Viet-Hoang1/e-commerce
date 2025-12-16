import { Router } from 'express'
import attributeRoute from '../modules/attributes/attribute.route'
import attributeValueRoute from '../modules/attributeValue/attributeValue.route'
import authRoute from '../modules/auth/routes/auth.route.js'
import badgeRoute from '../modules/badge/badge.route.js'
import brandRoute from '../modules/brand/brand.route.js'
import categoryRoute from '../modules/category/category.route.js'
import orderRouter from '../modules/order/order.route'
import productBadgeRoute from '../modules/product-badge/product-badge.route.js'
import productFaqRoute from '../modules/product-faq/product-faq.route.js'
import productVariantRoute from '../modules/product-variant/product-variant.route.js'
import productRoute from '../modules/product/product.route.js'
import warrantyPoliciesRoute from '../modules/warrantyPolicies/warrantyPolicies.route.js'
import userRoute from '../modules/user/user.route.js'
import adminRoute from './admin.route.js'
import errorRoute from './error.route.js'
import homeRoute from './home.route.js'

const router = Router()

router.use('/', homeRoute)
router.use('/auth', authRoute)
router.use('/users', userRoute)
router.use('/brands', brandRoute)
router.use('/categories', categoryRoute)
router.use('/badges', badgeRoute)
router.use('/products', productRoute)
router.use('/productFaqs', productFaqRoute)
router.use('/errors', errorRoute)
router.use('/product-badges', productBadgeRoute)
router.use('/orders', orderRouter)
router.use('/attributes', attributeRoute)
router.use('/attributes', attributeValueRoute)
router.use('/warranty-policies', warrantyPoliciesRoute)
router.use('/products', warrantyPoliciesRoute)
router.use('/product-variants', productVariantRoute)

router.use('/admin', adminRoute)

export default router
