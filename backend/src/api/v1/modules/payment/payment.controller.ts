import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import type {
  CreatePaymentBody,
  ListPaymentsQuery,
  PaymentIdParam,
  UpdatePaymentBody,
} from './payment.schema'
import { paymentService } from './payment.service'

class PaymentController {
  findAll = async (req: Request, res: Response) => {
    const query = req.validatedData?.query as ListPaymentsQuery

    const { payments, total, page, limit } = await paymentService.findAll(query)

    SuccessResponse.paginated(
      res,
      payments,
      { page, limit, total },
      'Payments retrieved successfully',
    )
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as PaymentIdParam

    const payment = await paymentService.findById(id)

    SuccessResponse.send(res, payment, 'Payment retrieved successfully')
  }

  create = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as CreatePaymentBody

    const payment = await paymentService.create(data)

    SuccessResponse.created(res, payment, 'Payment created successfully')
  }

  updateById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as PaymentIdParam
    const data = req.validatedData?.body as UpdatePaymentBody

    const updatedPayment = await paymentService.updateById(id, data)

    SuccessResponse.send(res, updatedPayment, 'Payment updated successfully')
  }

  deleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as PaymentIdParam

    const deletedPayment = await paymentService.deleteById(id)

    SuccessResponse.send(res, deletedPayment, 'Payment deleted successfully')
  }

  softDeleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as PaymentIdParam

    const softDeletedPayment = await paymentService.softDeleteById(id)

    SuccessResponse.send(
      res,
      softDeletedPayment,
      'Payment soft-deleted successfully',
    )
  }

  restoreById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as PaymentIdParam

    const restoredPayment = await paymentService.restoreById(id)

    SuccessResponse.send(res, restoredPayment, 'Payment restored  successfully')
  }
}

export const paymentController = new PaymentController()
export default PaymentController
