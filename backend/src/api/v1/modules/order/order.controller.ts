import { UnauthorizedException } from '@v1/shared/models/app-error.model'
import { SuccessResponse } from '@v1/shared/models/success-response.model'
import type { Request, Response } from 'express'
import {
  type CreateOrderBody,
  type listOrdersQuerySchema,
  type OrderIdParam,
  type UpdateOrderBody,
} from './order.schema'
import { orderService } from './order.service'
import type { PaymentRequestMeta } from './payment/payment.strategy.interface'

class OrderController {
  findAll = async (req: Request, res: Response) => {
    const query = req.validatedData?.query as listOrdersQuerySchema

    const { orders, total, page, limit } = await orderService.findAll(query)

    SuccessResponse.paginated(
      res,
      orders,
      { page, limit, total },
      'Orders retrieved successfully',
    )
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as OrderIdParam

    const order = await orderService.findById(id)

    SuccessResponse.send(res, order, 'Order retrieved successfully')
  }

  createAdminOrder = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as CreateOrderBody
    const idempotencyKey = req.headers['idempotency-key'] as string | undefined

    const requestMeta: PaymentRequestMeta = {
      ipAddress: req.ip ?? req.socket.remoteAddress,
      returnUrl: req.query.returnUrl as string | undefined,
      locale: req.headers['accept-language']?.startsWith('vi') ? 'vn' : 'en',
    }

    const created = await orderService.create(data, requestMeta, idempotencyKey)
    SuccessResponse.created(res, created, 'Order created successfully')
  }

  createUserOrder = async (req: Request, res: Response) => {
    const userId = req.user?.id
    if (!userId) throw new UnauthorizedException('User authentication required')

    const data = req.validatedData?.body as CreateOrderBody
    const idempotencyKey = req.headers['idempotency-key'] as string | undefined

    const requestMeta: PaymentRequestMeta = {
      ipAddress: req.ip ?? req.socket.remoteAddress,
      returnUrl: req.query.returnUrl as string | undefined,
      locale: req.headers['accept-language']?.startsWith('vi') ? 'vn' : 'en',
    }

    const created = await orderService.create(
      { ...data, userId },
      requestMeta,
      idempotencyKey,
    )
    SuccessResponse.created(res, created, 'Order created successfully')
  }

  updateById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as OrderIdParam
    const data = req.validatedData?.body as UpdateOrderBody

    const updated = await orderService.updateById(id, data)

    SuccessResponse.send(res, updated, 'Order updated successfully')
  }

  deleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as OrderIdParam

    const deleted = await orderService.deleteById(id)

    SuccessResponse.send(res, deleted, 'Order deleted permanently')
  }

  softDeleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as OrderIdParam

    const deleted = await orderService.softDeleteById(id)

    SuccessResponse.send(res, deleted, 'Order soft deleted successfully')
  }

  restoreById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as OrderIdParam

    const restored = await orderService.restoreById(id)

    SuccessResponse.send(res, restored, 'Order restored successfully')
  }

  findUserOrders = async (req: Request, res: Response) => {
    const userId = req.user!.id
    const query = req.validatedData?.query as listOrdersQuerySchema

    const { orders, total, page, limit } = await orderService.findUserOrders(
      userId,
      query,
    )

    SuccessResponse.paginated(
      res,
      orders,
      { page, limit, total },
      'Orders retrieved successfully',
    )
  }

  findUserOrderById = async (req: Request, res: Response) => {
    const userId = req.user!.id
    const { orderId } = req.validatedData?.params as { orderId: number }

    const order = await orderService.findUserOrderById(userId, orderId)

    SuccessResponse.send(res, order, 'Order retrieved successfully')
  }

  cancelUserOrder = async (req: Request, res: Response) => {
    const userId = req.user!.id
    const { orderId } = req.validatedData?.params as { orderId: number }

    const cancelled = await orderService.cancelUserOrder(userId, orderId)

    SuccessResponse.send(res, cancelled, 'Order cancelled successfully')
  }

  exportUserOrderPDF = async (req: Request, res: Response) => {
    const userId = req.user!.id
    const { orderId } = req.validatedData?.params as { orderId: number }

    const pdfBuffer = await orderService.generateInvoicePDF(orderId, userId)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${orderId}.pdf"`,
    )
    res.send(pdfBuffer)
  }

  exportOrderPDF = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as OrderIdParam

    const pdfBuffer = await orderService.generateInvoicePDF(id)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${id}.pdf"`,
    )
    res.send(pdfBuffer)
  }
}

export const orderController = new OrderController()
export default OrderController
