import { z } from 'zod'
import {
  createPaginationSchema,
  emailSchema,
  numericIdParamSchema,
  passwordSchema,
} from '../../shared/schemas'

export const userSchema = z.object({
  id: z.number(),
  email: z.email(),
  password: z.string(),
  googleId: z.string().nullable(),
  name: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  emailVerified: z.boolean(),
  lastLoginAt: z.date().nullable(),
  isActive: z.boolean(),
  isMfaActive: z.boolean(),
  twoFactorSecret: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const userDtoSchema = userSchema.omit({
  password: true,
  twoFactorSecret: true,
})

const USER_SORT_FIELDS = ['createdAt', 'email', 'name', 'lastLoginAt'] as const

export const listUsersQuerySchema = createPaginationSchema(
  USER_SORT_FIELDS as unknown as string[],
).extend({
  isActive: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  emailVerified: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
})

export const userIdParamSchema = numericIdParamSchema

export const createUserBodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim()
    .optional(),
  phoneNumber: z
    .string()
    .min(8, 'Phone number must be at least 8 characters')
    .max(14, 'Phone number must be at most 14 characters')
    .optional(),
})

export const updateUserBodySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim()
    .optional(),
  phoneNumber: z
    .string()
    .min(8, 'Phone number must be at least 8 characters')
    .max(14, 'Phone number must be at most 14 characters')
    .trim()
    .optional(),
  emailVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isMfaActive: z.boolean().optional(),
})

export const favoriteProductParamSchema = z.object({
  productId: z.coerce.number().int().positive(),
})

export type User = z.infer<typeof userSchema>
export type UserDto = z.infer<typeof userDtoSchema>

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>

export type UserIdParam = z.infer<typeof userIdParamSchema>

export type CreateUserBody = z.infer<typeof createUserBodySchema>
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>

export type favoriteProductParam = z.infer<typeof favoriteProductParamSchema>
