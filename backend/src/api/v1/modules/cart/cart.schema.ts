import { z } from 'zod'

export const addToCartBodySchema = z.object({
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

export const updateCartItemBodySchema = z.object({
  quantity: z
    .number()
    .int()
    .min(0, 'Quantity must be at least 0')
    .max(999, 'Quantity cannot exceed 999'),
})

export const removeCartItemBodySchema = z.object({
  productId: z.number().int().positive(),
  variantId: z.number().int().positive(),
})

export const removeCartItemsBodySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        variantId: z.number().int().positive(),
      }),
    )
    .min(1, 'At least one item is required'),
})

export const cartItemDtoSchema = z.object({
  productId: z.number(),
  variantId: z.number(),
  quantity: z.number(),
  price: z.number(), // Snapshot price
  currentPrice: z.number(), // Current price from DB
  priceChanged: z.boolean(),

  product: z.object({
    id: z.number(),
    name: z.string(),
    sku: z.string(),
    image: z.string().nullable(),
    status: z.string(),
  }),

  variant: z.object({
    id: z.number(),
    title: z.string().nullable(),
    sku: z.string(),
    price: z.number(),
    stockQuantity: z.number(),
    isDefault: z.boolean(),
  }),

  subtotal: z.number(),
  addedAt: z.string(),
})

export const cartDtoSchema = z.object({
  items: z.array(cartItemDtoSchema),
  summary: z.object({
    itemCount: z.number(),
    totalQuantity: z.number(),
    subtotal: z.number(),
    hasPriceChanges: z.boolean(),
    hasOutOfStock: z.boolean(),
  }),
  updatedAt: z.string(),
})

export type AddToCartBody = z.infer<typeof addToCartBodySchema>
export type UpdateCartItemBody = z.infer<typeof updateCartItemBodySchema>
export type RemoveCartItemBody = z.infer<typeof removeCartItemBodySchema>
export type RemoveCartItemsBody = z.infer<typeof removeCartItemsBodySchema>

export type CartItemDto = z.infer<typeof cartItemDtoSchema>
export type CartDto = z.infer<typeof cartDtoSchema>
