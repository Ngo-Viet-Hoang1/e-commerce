import crypto from 'crypto'
import { vnpayConfig } from './vnpay.config'

function sortObject(obj: Record<string, string>): Record<string, string> {
  return Object.keys(obj)
    .sort()
    .reduce(
      (sorted, key) => {
        sorted[key] = obj[key]!
        return sorted
      },
      {} as Record<string, string>,
    )
}

function createHmacSignature(data: string): string {
  return crypto
    .createHmac('sha512', vnpayConfig.hashSecret)
    .update(Buffer.from(data, 'utf-8'))
    .digest('hex')
}

function encodeVnpValue(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, '+')
}

function buildSignedQuery(obj: Record<string, string>): string {
  return Object.keys(obj)
    .sort()
    .map((key) => `${key}=${encodeVnpValue(obj[key] ?? '')}`)
    .join('&')
}

function toVnPayDate(date = new Date()): string {
  const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000)
  const yyyy = vnDate.getUTCFullYear()
  const MM = String(vnDate.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(vnDate.getUTCDate()).padStart(2, '0')
  const HH = String(vnDate.getUTCHours()).padStart(2, '0')
  const mm = String(vnDate.getUTCMinutes()).padStart(2, '0')
  const ss = String(vnDate.getUTCSeconds()).padStart(2, '0')
  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`
}

export interface CreateVnpayUrlParams {
  orderId: string
  amount: number
  orderInfo: string
  ipAddr: string
  locale?: 'vn' | 'en'
}

export function createVnpayUrl(params: CreateVnpayUrlParams): string {
  const normalizedOrderInfo = params.orderInfo.replace(/[#+]/g, ' ').trim()

  const vnpParams: Record<string, string> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: vnpayConfig.tmnCode,
    vnp_Locale: params.locale ?? 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: params.orderId,
    vnp_OrderInfo: normalizedOrderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: String(Math.round(params.amount * 100)),
    vnp_ReturnUrl: vnpayConfig.returnUrl,
    vnp_IpAddr: params.ipAddr,
    vnp_CreateDate: toVnPayDate(),
  }

  const sorted = sortObject(vnpParams)
  const signData = buildSignedQuery(sorted)
  const secureHash = createHmacSignature(signData)

  return `${vnpayConfig.url}?${signData}&vnp_SecureHash=${secureHash}`
}

export interface VnPayVerifyResult {
  isValid: boolean
  isSuccess: boolean
}

export function verifyVnpayReturn(
  query: Record<string, string>,
): VnPayVerifyResult {
  const secureHash = query['vnp_SecureHash']
  const params = { ...query }
  delete params['vnp_SecureHash']
  delete params['vnp_SecureHashType']

  const sorted = sortObject(params)
  const signData = buildSignedQuery(sorted)
  const checkHash = createHmacSignature(signData)

  return {
    isValid: secureHash === checkHash,
    isSuccess: query['vnp_ResponseCode'] === '00',
  }
}

export function normalizeIpAddress(ip?: string): string {
  if (!ip || ip === '::1' || ip === '::ffff:127.0.0.1') return '127.0.0.1'
  if (ip.startsWith('::ffff:')) return ip.slice(7)
  return ip
}
