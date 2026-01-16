import { z } from 'zod'

export const addToCartSchema = z.object({
  productId: z.number().int().positive('Product ID must be a positive integer'),
  variantId: z.number().int().positive('Variant ID must be a positive integer'),
  quantity: z
    .number()
    .int()
    .positive('Quantity must be a positive integer')
    .min(1, 'Quantity must be at least 1')
    .max(999, 'Quantity cannot exceed 999')
    .default(1),
})

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int()
    .min(0, 'Quantity must be at least 0')
    .max(999, 'Quantity cannot exceed 999'),
})

export const removeCartItemSchema = z.object({
  productId: z.number().int().positive(),
  variantId: z.number().int().positive(),
})

export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>
