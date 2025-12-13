import { z } from 'zod'
import { emailSchema, passwordSchema } from '../../shared/schemas'

export const changePasswordBodySchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const loginBodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>
export type LoginBody = z.infer<typeof loginBodySchema>
