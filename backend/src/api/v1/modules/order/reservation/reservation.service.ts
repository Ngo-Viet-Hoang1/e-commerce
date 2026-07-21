import { prisma } from '@v1/shared/config/database/postgres'
import logger from '@v1/shared/config/logger'
import type { PrismaTransaction } from '@v1/shared/interfaces/prisma.interface'
import { ConflictException } from '@v1/shared/models/app-error.model'
import cron, { type ScheduledTask } from 'node-cron'
import { PaymentStatus } from '../order.constants'
import { decrementStockOptimistic, incrementStock } from '../order.util'
import {
  ONLINE_PAYMENT_RESERVATION_TTL_MINUTES,
  RESERVATION_EXPIRATION_CRON,
  RESERVATION_STATUS,
} from './reservation.constants'
import { reservationRepository } from './reservation.repository'

interface ReservationOrderItem {
  variantId: number | null
  quantity: number
}

interface ReservationOrder {
  orderId: number
  orderItems: ReservationOrderItem[]
}

class ReservationService {
  private expirationTask: ScheduledTask | null = null

  createReservationForOrder = async (
    order: ReservationOrder,
    tx: PrismaTransaction,
    ttlMinutes = ONLINE_PAYMENT_RESERVATION_TTL_MINUTES,
  ) => {
    const items = order.orderItems.filter((item) => item.variantId !== null)

    const existing = await tx.stockReservation.findUnique({
      where: { orderId: order.orderId },
      select: { id: true, status: true },
    })

    if (existing) {
      if (existing.status === RESERVATION_STATUS.ACTIVE) {
        throw new ConflictException('Reservation already active for this order')
      }
      return
    }

    for (const item of items) {
      await decrementStockOptimistic(tx, item.variantId!, item.quantity)
    }

    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000)

    await tx.stockReservation.create({
      data: {
        order: { connect: { orderId: order.orderId } },
        status: RESERVATION_STATUS.ACTIVE,
        expiresAt,
        items: {
          create: items.map((item) => ({
            variant: { connect: { id: item.variantId! } },
            quantity: item.quantity,
          })),
        },
      },
    })
  }

  commitByOrderId = async (orderId: number, tx: PrismaTransaction) => {
    const updated = await tx.stockReservation.updateMany({
      where: {
        orderId,
        status: RESERVATION_STATUS.ACTIVE,
      },
      data: {
        status: RESERVATION_STATUS.COMMITTED,
        committedAt: new Date(),
      },
    })

    return updated.count > 0
  }

  releaseByOrderId = async (
    orderId: number,
    tx: PrismaTransaction,
    releaseReason?: string,
  ) => {
    const reservation = await tx.stockReservation.findUnique({
      where: { orderId },
      include: { items: true },
    })

    if (!reservation || reservation.status !== RESERVATION_STATUS.ACTIVE) {
      return false
    }

    for (const item of reservation.items) {
      await incrementStock(tx, item.variantId!, item.quantity)
    }

    await tx.stockReservation.update({
      where: { id: reservation.id },
      data: {
        status:
          releaseReason === 'expired'
            ? RESERVATION_STATUS.EXPIRED
            : RESERVATION_STATUS.RELEASED,
        releasedAt: new Date(),
        releaseReason: releaseReason ?? 'released',
      },
    })

    return true
  }

  expireReservations = async () => {
    const now = new Date()
    const expired = await reservationRepository.findExpiredActive(now, 100)

    if (expired.length === 0) return 0

    let processed = 0

    for (const reservation of expired) {
      await prisma.$transaction(async (tx) => {
        const released = await this.releaseByOrderId(
          reservation.orderId,
          tx,
          'expired',
        )

        if (!released) return

        await tx.order.updateMany({
          where: {
            orderId: reservation.orderId,
            paymentStatus: PaymentStatus.PENDING,
          },
          data: { paymentStatus: PaymentStatus.FAILED },
        })

        processed += 1
      })
    }

    if (processed > 0) {
      logger.info(`Expired stock reservations processed ${processed}`)
    }

    return processed
  }

  startExpirationJob = () => {
    if (this.expirationTask) return

    this.expirationTask = cron.schedule(
      RESERVATION_EXPIRATION_CRON,
      () => {
        this.expireReservations().catch((error) => {
          logger.error('Reservation expiration job failed', {
            error: error instanceof Error ? error.message : String(error),
          })
        })
      },
      { timezone: 'Asia/Ho_Chi_Minh' },
    )

    logger.info('Reservation expiration job started', {
      cron: RESERVATION_EXPIRATION_CRON,
      ttlMinutes: ONLINE_PAYMENT_RESERVATION_TTL_MINUTES,
    })
  }

  stopExpirationJob = () => {
    if (!this.expirationTask) return

    this.expirationTask.stop()
    this.expirationTask.destroy()
    this.expirationTask = null
    logger.info('Reservation expiration job stopped')
  }
}

export const reservationService = new ReservationService()
export default ReservationService
