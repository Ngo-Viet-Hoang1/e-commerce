import { Router } from 'express'
import { vnpayWebhookController } from './vnpay.webhook.controller'

const router = Router()

router.get('/vnpay-ipn', vnpayWebhookController.handleIpn)

router.get('/vnpay-return', vnpayWebhookController.handleReturn)

export default router
