import z from 'zod'

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ]),
  paymentStatus: z.enum(['pending', 'paid', 'failed']),
})

export type UpdateOrderStatusInputs = z.infer<typeof updateOrderStatusSchema>
