import z from 'zod'
import { emailSchema, passwordSchema } from './common.schema'

export const registerInputsSchema = z
  .object({
    username: z.string(),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export type RegisterInputs = z.infer<typeof registerInputsSchema>
export type LoginInputs = z.infer<typeof loginSchema>
