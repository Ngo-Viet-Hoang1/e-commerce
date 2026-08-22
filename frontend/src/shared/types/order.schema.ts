import { z } from 'zod'

export const orderItemInputSchema = z.object({
  productId: z.number().int().positive(),
  variantId: z.number().int().positive(),
  quantity: z.number().int().positive().min(1),
  discount: z.number().min(0).optional().default(0),
})

export const createOrderSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, 'Phải có ít nhất 1 sản phẩm'),

  shippingRecipientName: z
    .string()
    .min(2, 'Tên người nhận phải có ít nhất 2 ký tự')
    .max(255, 'Tên người nhận quá dài'),
  shippingPhone: z
    .string()
    .regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),

  shippingProvinceId: z.number().int().positive('Vui lòng chọn tỉnh/thành phố'),
  shippingDistrictId: z.number().int().positive('Vui lòng chọn quận/huyện'),
  shippingAddressDetail: z
    .string()
    .min(5, 'Địa chỉ chi tiết phải có ít nhất 5 ký tự')
    .optional(),

  paymentMethod: z.enum(['cod', 'vnpay', 'paypal'] as const),
  paymentStatus: z
    .enum(['pending', 'paid', 'failed'] as const)
    .optional()
    .default('pending'),

  shippingFee: z.number().min(0).optional().default(0),
  currency: z.string().optional().default('VND'),
  metadata: z.record(z.string(), z.any()).optional(),
})

export type CreateOrderInputs = z.infer<typeof createOrderSchema>
