import { z } from 'zod'

export const idParamSchema = z.object({
  id: z.uuid('Invalid ID format'),
})

export const numericIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID must be numeric')
    .transform((val) => parseInt(val, 10)),
})

export const emailSchema = z.email('Invalid email address').toLowerCase().trim()

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be at most 100 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one lowercase letter, one uppercase letter, and one number',
  )

export const urlSchema = z.url('Invalid URL')

export const phoneSchema = z
  .string()
  .regex(/^[+]?[\d\s()-]{10,}$/, 'Invalid phone number')

export const dateStringSchema = z.iso
  .datetime('Invalid date format')
  .or(z.iso.date())

export const dateRangeSchema = z
  .object({
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate)
      }
      return true
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    },
  )

export const createEnumSchema = <T extends readonly string[]>(
  values: T,
  name?: string,
) => {
  return z.enum(values as unknown as [string, ...string[]], {
    message: `Invalid ${name || 'value'}. Must be one of: ${values.join(', ')}`,
  })
}

export const csvToArraySchema = z
  .string()
  .transform((val) => val.split(',').map((item) => item.trim()))
  .pipe(z.array(z.string().min(1)))

export const stringToBooleanSchema = z
  .string()
  .transform((val) => val === 'true' || val === '1')
  .pipe(z.boolean())

export const positiveIntSchema = z.number().int().positive()
export const nonNegativeIntSchema = z.number().int().nonnegative()

export const stringToNumberSchema = z
  .string()
  .transform((val) => parseFloat(val))
  .pipe(z.number())

export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(1, 'Search query is required')
    .max(255, 'Search query too long'),
})

export const baseFilterSchema = z.object({
  isActive: stringToBooleanSchema.optional(),
  createdAtFrom: dateStringSchema.optional(),
  createdAtTo: dateStringSchema.optional(),
})
