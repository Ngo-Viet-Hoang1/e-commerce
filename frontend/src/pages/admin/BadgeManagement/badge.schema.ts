import z from 'zod'

export const createBadgeSchema = z.object({
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(100, 'Code must be at most 100 characters'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be at most 255 characters'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .or(z.literal('')),
  iconUrl: z.string().optional().or(z.literal('')),
  criteria: z.any().optional(),
})

export const updateBadgeSchema = z.object({
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(100, 'Code must be at most 100 characters')
    .optional(),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be at most 255 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .or(z.literal('')),
  iconUrl: z.string().optional().or(z.literal('')),
  criteria: z.any().optional(),
})

export type CreateBadgeInputs = z.infer<typeof createBadgeSchema>
export type UpdateBadgeInputs = z.infer<typeof updateBadgeSchema>
