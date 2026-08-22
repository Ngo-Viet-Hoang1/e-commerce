import { z } from 'zod'

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(100, 'Tên không được quá 100 ký tự')
    .trim()
    .optional(),
  phoneNumber: z
    .string()
    .min(8, 'Số điện thoại phải có ít nhất 8 ký tự')
    .max(14, 'Số điện thoại không được quá 14 ký tự')
    .regex(/^[0-9+\-() ]*$/, 'Số điện thoại không hợp lệ')
    .trim()
    .optional(),
})

export type UpdateUserInputs = z.infer<typeof updateUserSchema>
