import { Prisma } from '@generated/prisma/client'
import logger from '@v1/shared/config/logger'
import {
  ConflictException,
  NotFoundException,
} from '@v1/shared/models/app-error.model'
import { PaymentStatus } from '../../order/order.constants'
import { orderService } from '../../order/order.service'
import {
  verifyVnpayReturn,
  type VnPayVerifyResult,
} from '../../order/payment/strategies/vnpay/vnpay.helper'
import { paymentRepository } from '../payment.repository'

export interface IpnResult {
  RspCode: string
  Message: string
}

export interface ReturnResult {
  isValid: boolean
  isSuccess: boolean
  orderId: string
  responseCode: string
}

class VnpayWebhookService {
  handleIpn = async (query: Record<string, string>): Promise<IpnResult> => {
    const { isValid, isSuccess } = verifyVnpayReturn(query)

    if (!isValid) return { RspCode: '97', Message: 'Invalid signature' }

    const orderId = Number(query['vnp_TxnRef'])

    if (!orderId || isNaN(orderId))
      return { RspCode: '01', Message: 'Invalid order ID' }

    const rawAmount = Number(query['vnp_Amount'])
    if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
      return { RspCode: '04', Message: 'Invalid amount' }
    }

    const transactionId = query['vnp_TransactionNo'] ?? query['vnp_TxnRef']
    if (!transactionId) {
      return { RspCode: '01', Message: 'Missing transaction ID' }
    }

    try {
      const order = await orderService.findById(orderId)

      if (!order.userId) {
        throw new Error('ORDER_USER_NOT_FOUND')
      }

      if (order.paymentStatus !== PaymentStatus.PENDING) {
        return { RspCode: '02', Message: 'Already confirmed' }
      }

      const expectedAmount = Math.round(Number(order.totalAmount) * 100)
      if (expectedAmount !== rawAmount) {
        throw new Error('AMOUNT_MISMATCH')
      }

      await paymentRepository.create({
        paymentMethod: 'vnpay',
        paymentStatus: isSuccess ? 'paid' : 'failed',
        amount: rawAmount / 100,
        currency: 'VND',
        transactionId,
        metaData: query,
        order: { connect: { orderId } },
        user: { connect: { id: order.userId } },
      })

      if (isSuccess) {
        await orderService.confirmPayment(orderId)
      } else {
        await orderService.markPaymentFailed(orderId, 'vnpay_payment_failed')
      }

      return { RspCode: '00', Message: 'Confirm success' }
    } catch (error) {
      if (error instanceof ConflictException) {
        // Duplicate payment record can happen on VNPay retries or concurrent callbacks.
        // Re-check order status to decide whether this callback is truly completed.
        const latestOrder = await orderService.findById(orderId)

        if (latestOrder.paymentStatus === PaymentStatus.PAID) {
          return { RspCode: '02', Message: 'Already confirmed' }
        }

        // Heal partial processing: payment record exists but order status was not updated.
        if (isSuccess) {
          await orderService.confirmPayment(orderId)
        } else {
          await orderService.markPaymentFailed(orderId, 'vnpay_payment_failed')
        }

        return { RspCode: '00', Message: 'Confirm success' }
      }

      if (error instanceof NotFoundException) {
        return { RspCode: '01', Message: 'Order not found' }
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return { RspCode: '02', Message: 'Already confirmed' }
        }
      }

      if (error instanceof Error) {
        if (error.message === 'ALREADY_PROCESSED') {
          return { RspCode: '02', Message: 'Already confirmed' }
        }

        if (error.message === 'ORDER_USER_NOT_FOUND') {
          return { RspCode: '01', Message: 'Invalid order user' }
        }

        if (error.message === 'AMOUNT_MISMATCH') {
          return { RspCode: '04', Message: 'Invalid amount' }
        }
      }

      logger.error('VNPay IPN processing failed', {
        orderId,
        transactionId,
        error: error instanceof Error ? error.message : String(error),
      })

      return { RspCode: '99', Message: 'Internal error' }
    }
  }

  handleReturn = (query: Record<string, string>): ReturnResult => {
    const { isValid, isSuccess }: VnPayVerifyResult = verifyVnpayReturn(query)

    return {
      isValid,
      isSuccess,
      orderId: query['vnp_TxnRef'] ?? '',
      responseCode: query['vnp_ResponseCode'] ?? 'unknown',
    }
  }
}

export const vnpayWebhookService = new VnpayWebhookService()
