import type { Prisma } from '@generated/prisma/client'
import { prisma } from '@v1/shared/config/database/postgres'
import { executePrismaQuery } from '@v1/shared/utils/prisma-error.util'

export const RESERVATION_ITEM_SELECT = {
  id: true,
  variantId: true,
  quantity: true,
} as const

export const RESERVATION_SELECT = {
  id: true,
  orderId: true,
  status: true,
  expiresAt: true,
  committedAt: true,
  releasedAt: true,
  releaseReason: true,
  createdAt: true,
  updatedAt: true,
  items: {
    select: RESERVATION_ITEM_SELECT,
  },
} as const satisfies Prisma.StockReservationSelect

class ReservationRepository {
  create = async (data: Prisma.StockReservationCreateInput) => {
    return executePrismaQuery(() =>
      prisma.stockReservation.create({
        data,
        select: RESERVATION_SELECT,
      }),
    )
  }

  findByOrderId = async (orderId: number) => {
    return executePrismaQuery(() =>
      prisma.stockReservation.findUnique({
        where: { orderId },
        select: RESERVATION_SELECT,
      }),
    )
  }

  findExpiredActive = async (now: Date, take = 100) => {
    return executePrismaQuery(() =>
      prisma.stockReservation.findMany({
        where: {
          status: 'active',
          expiresAt: { lte: now },
        },
        orderBy: { expiresAt: 'asc' },
        take,
        select: RESERVATION_SELECT,
      }),
    )
  }
}

export const reservationRepository = new ReservationRepository()
export default ReservationRepository
