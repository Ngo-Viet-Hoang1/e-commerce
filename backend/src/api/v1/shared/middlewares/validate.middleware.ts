import type { NextFunction, Request, Response } from 'express'
import { z, type ZodError, type ZodSchema } from 'zod'

import { ValidationException } from '../models/app-error.model.js'

export interface ValidationOptions {
  /**
   * Strip unknown keys from the validated data
   * @default true
   */
  stripUnknown?: boolean

  /**
   * Allow partial validation (makes all fields optional)
   * @default false
   */
  partial?: boolean
}

export type ValidationSource = 'body' | 'query' | 'params' | 'headers'

export function formatZodError(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {}

  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root'
    const message = issue.message

    if (!formatted[path]) {
      formatted[path] = []
    }

    formatted[path].push(message)
  }

  return formatted
}

/**
 * Validation middleware factory that validates request data against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param source - Source of data to validate (body, query, params, headers)
 * @param options - Additional validation options
 *
 * @example
 * ```typescript
 * router.post('/users',
 *   validate(createUserSchema, 'body'),
 *   userController.create
 * )
 * ```
 */
export function validate(
  schema: ZodSchema,
  source: ValidationSource = 'body',
  options: ValidationOptions = {},
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const { partial = false } = options

      // Get the data to validate
      const dataToValidate = req[source]

      // Apply options to schema
      let effectiveSchema = schema

      if (
        partial &&
        'partial' in schema &&
        typeof schema.partial === 'function'
      ) {
        effectiveSchema = (schema as { partial: () => ZodSchema }).partial()
      }

      // Validate and parse the data
      const validatedData = await effectiveSchema.parseAsync(dataToValidate)

      // Store validated data in a custom property
      if (!req.validatedData) {
        req.validatedData = {}
      }
      req.validatedData[source] = validatedData

      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = formatZodError(error)

        throw new ValidationException(formattedErrors, {
          source,
          validationErrors: formattedErrors,
        })
      }
      throw error
    }
  }
}

/**
 * Validates multiple sources at once
 *
 * @example
 * ```typescript
 * router.get('/users/:id',
 *   validateMultiple({
 *     params: userIdParamsSchema,
 *     query: paginationQuerySchema
 *   }),
 *   userController.getById
 * )
 * ```
 */
export function validateMultiple(schemas: {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
  headers?: ZodSchema
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationPromises: Promise<unknown>[] = []

      // Initialize validatedData object
      if (!req.validatedData) {
        req.validatedData = {}
      }

      // Validate each source
      for (const [source, schema] of Object.entries(schemas)) {
        if (schema) {
          const dataToValidate = req[source as ValidationSource]
          validationPromises.push(
            schema.parseAsync(dataToValidate).then((validatedData) => {
              req.validatedData![source as ValidationSource] = validatedData
            }),
          )
        }
      }

      await Promise.all(validationPromises)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = formatZodError(error)

        throw new ValidationException(formattedErrors, {
          validationErrors: formattedErrors,
        })
      }
      throw error
    }
  }
}

/**
 * Simplified custom error messages for common validations
 */
export const customMessages = {
  required: 'This field is required',
  email: 'Invalid email address',
  url: 'Invalid URL',
  uuid: 'Invalid UUID',
  minString: (min: number) => `Must be at least ${min} characters`,
  maxString: (max: number) => `Must be at most ${max} characters`,
  minNumber: (min: number) => `Must be at least ${min}`,
  maxNumber: (max: number) => `Must be at most ${max}`,
  minArray: (min: number) => `Must contain at least ${min} items`,
  maxArray: (max: number) => `Must contain at most ${max} items`,
}
