import { emailSchema, passwordSchema } from '@/schema/common.schema'
import z from 'zod'

export const createUserSchema = z.object({
  name: z.string(),
  email: emailSchema,
  password: passwordSchema,
})

export type CreateUserInputs = z.infer<typeof createUserSchema>
