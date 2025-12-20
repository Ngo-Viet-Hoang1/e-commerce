import { emailSchema, passwordSchema } from '@/schema/common.schema'
import z from 'zod'

export const createUserSchema = z.object({
  name: z.string(),
  email: emailSchema,
  password: passwordSchema,
})

export const updateUserSchema = z.object({
  name: z.string().min(1),
  email: emailSchema,
})

export type UpdateUserInputs = z.infer<typeof updateUserSchema>
export type CreateUserInputs = z.infer<typeof createUserSchema>
