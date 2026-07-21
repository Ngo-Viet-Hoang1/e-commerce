export const RESERVATION_STATUS = {
  ACTIVE: 'active',
  COMMITTED: 'committed',
  RELEASED: 'released',
  EXPIRED: 'expired',
} as const

export type ReservationStatus =
  (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS]

export const RESERVATION_STATUSES = Object.values(RESERVATION_STATUS)

export const ONLINE_PAYMENT_RESERVATION_TTL_MINUTES = 15
export const RESERVATION_EXPIRATION_CRON = '*/15 * * * *'
