import z from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
})

export type CreateCategoryInputs = z.infer<typeof createCategorySchema>
export type UpdateCategoryInputs = z.infer<typeof updateCategorySchema>
