import type { Request, Response } from 'express'
import { vnpayWebhookService } from './vnpay.webhook.service'

class VnpayWebhookController {
  handleIpn = async (req: Request, res: Response): Promise<void> => {
    const result = await vnpayWebhookService.handleIpn(
      req.query as Record<string, string>,
    )
    res.json(result)
  }

  handleReturn = (req: Request, res: Response): void => {
    const { isValid, isSuccess, orderId, responseCode } =
      vnpayWebhookService.handleReturn(req.query as Record<string, string>)

    const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173'

    if (!isValid) {
      res.redirect(`${clientUrl}/payment/failed?reason=invalid_signature`)
      return
    }

    if (isSuccess)
      return res.redirect(`${clientUrl}/payment/success?orderId=${orderId}`)

    res.redirect(
      `${clientUrl}/payment/failed?orderId=${orderId}&code=${responseCode}`,
    )
  }
}

export const vnpayWebhookController = new VnpayWebhookController()
