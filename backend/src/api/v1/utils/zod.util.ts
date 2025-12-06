import { z, type ZodSchema } from 'zod'

/**
 * Utility functions for working with Zod schemas
 */

/**
 * Create a paginated response schema
 */
export function createPaginatedResponseSchema<T extends ZodSchema>(
  itemSchema: T,
) {
  return z.object({
    success: z.boolean(),
    data: z.object({
      items: z.array(itemSchema),
      pagination: z.object({
        page: z.number().int(),
        limit: z.number().int(),
        total: z.number().int(),
        totalPages: z.number().int(),
      }),
    }),
  })
}

/**
 * Create a success response schema
 */
export function createSuccessResponseSchema<T extends ZodSchema>(
  dataSchema: T,
) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  })
}

/**
 * Create an error response schema
 */
export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  status: z.enum(['fail', 'error']),
  error: z.object({
    code: z.string(),
    statusCode: z.number(),
    category: z.string(),
    severity: z.string(),
    details: z.unknown().optional(),
    context: z.record(z.string(), z.unknown()).optional(),
    stack: z.string().optional(),
  }),
  timestamp: z.string(),
  path: z.string(),
  method: z.string(),
  requestId: z.string(),
})

/**
 * Parse and validate data safely
 */
export async function safeValidate<T>(
  schema: ZodSchema<T>,
  data: unknown,
): Promise<{ success: true; data: T } | { success: false; error: z.ZodError }> {
  const result = await schema.safeParseAsync(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return { success: false, error: result.error }
}

/**
 * Create a partial schema (all fields optional)
 */
export function makePartial<T extends z.ZodObject<z.ZodRawShape>>(schema: T) {
  return schema.partial()
}

/**
 * Create a required schema (all fields required)
 */
export function makeRequired<T extends z.ZodObject<z.ZodRawShape>>(schema: T) {
  return schema.required()
}

/**
 * Pick specific fields from a schema
 */
export function pickFields<
  T extends z.ZodObject<z.ZodRawShape>,
  K extends keyof z.infer<T>,
>(schema: T, keys: K[]) {
  return schema.pick(
    keys.reduce(
      (acc, key) => {
        acc[key as string] = true
        return acc
      },
      {} as Record<string, true>,
    ) as { [P in K]: true },
  )
}

/**
 * Omit specific fields from a schema
 */
export function omitFields<
  T extends z.ZodObject<z.ZodRawShape>,
  K extends keyof z.infer<T>,
>(schema: T, keys: K[]) {
  return schema.omit(
    keys.reduce(
      (acc, key) => {
        acc[key as string] = true
        return acc
      },
      {} as Record<string, true>,
    ) as { [P in K]: true },
  )
}

/**
 * Merge multiple schemas
 */
export function mergeSchemas<
  T extends z.ZodObject<z.ZodRawShape>,
  U extends z.ZodObject<z.ZodRawShape>,
>(schema1: T, schema2: U) {
  return schema1.merge(schema2)
}

/**
 * Create an enum schema from an array of strings
 */
export function createEnum<T extends readonly string[]>(
  values: T,
  errorMessage?: string,
) {
  return z.enum(values as unknown as [string, ...string[]], {
    message:
      errorMessage || `Invalid value. Must be one of: ${values.join(', ')}`,
  })
}

/**
 * Validate environment variables
 */
export function validateEnv<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
): z.infer<z.ZodObject<T>> {
  const result = schema.safeParse(process.env)

  if (!result.success) {
    // eslint-disable-next-line no-console
    console.error('❌ Invalid environment variables:', result.error.format())
    throw new Error('Invalid environment variables')
  }

  return result.data
}

/**
 * Type guard to check if value matches schema
 */
export function isValid<T>(schema: ZodSchema<T>, value: unknown): value is T {
  return schema.safeParse(value).success
}

/**
 * Get default values from a schema
 */
export function getDefaults<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
): Partial<z.infer<T>> {
  const shape = schema.shape
  const defaults: Record<string, unknown> = {}

  for (const key in shape) {
    const field = shape[key]
    if (field instanceof z.ZodDefault) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      defaults[key] = (field._def as any).defaultValue()
    }
  }

  return defaults as Partial<z.infer<T>>
}
