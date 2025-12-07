import { Prisma } from '@generated/prisma/client'
import {
  BadRequestException,
  ConflictException,
  DatabaseException,
  NotFoundException,
  ValidationException,
} from '../models/app-error.model'
import type { ErrorContext } from '../interfaces/error.interface'

/**
 * Handle Prisma errors and convert them to appropriate AppError instances
 */
export function handlePrismaError(
  error: unknown,
  context?: ErrorContext,
): never {
  // Handle known Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    handleKnownRequestError(error, context)
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    throw new DatabaseException(
      'Unknown database error occurred',
      error,
      context,
    )
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new ValidationException({ validation: [error.message] }, context)
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new DatabaseException(
      'Failed to initialize database connection',
      error,
      { ...context, operation: 'initialization' },
    )
  }

  // Fallback for unknown errors
  if (error instanceof Error) {
    throw new DatabaseException(error.message, error, context)
  }

  throw new DatabaseException('An unknown error occurred', undefined, context)
}

/**
 * Handle Prisma Known Request Errors with specific error codes
 * Reference: https://www.prisma.io/docs/reference/api-reference/error-reference
 */
function handleKnownRequestError(
  error: Prisma.PrismaClientKnownRequestError,
  context?: ErrorContext,
): never {
  const { code, meta } = error

  switch (code) {
    // Unique constraint violation
    case 'P2002': {
      const fields = (meta?.target as string[]) || []
      throw new ConflictException(
        `A record with this ${fields.join(', ')} already exists`,
        { fields, constraint: 'unique' },
        context,
      )
    }

    // Foreign key constraint violation
    case 'P2003': {
      throw new BadRequestException(
        'Invalid reference to related record',
        { field: meta?.field_name, constraint: 'foreign_key' },
        context,
      )
    }

    // Record not found
    case 'P2025': {
      throw new NotFoundException(
        (meta?.cause as string) || 'Record',
        undefined,
        context,
      )
    }

    // Required field missing
    case 'P2000': {
      throw new ValidationException(
        { [meta?.column_name as string]: ['This field is required'] },
        context,
      )
    }

    // Value too long for column
    case 'P2001': {
      throw new ValidationException(
        { [meta?.column_name as string]: ['Value is too long'] },
        context,
      )
    }

    // Dependent record not found
    case 'P2018': {
      throw new NotFoundException('Related record', undefined, context)
    }

    // Transaction failed
    case 'P2034': {
      throw new DatabaseException(
        'Transaction failed due to write conflict',
        error,
        { ...context, operation: 'transaction' },
      )
    }

    // Connection error
    case 'P1001':
    case 'P1002':
    case 'P1008': {
      throw new DatabaseException('Unable to connect to database', error, {
        ...context,
        operation: 'connection',
      })
    }

    // Timeout
    case 'P2024': {
      throw new DatabaseException('Database operation timed out', error, {
        ...context,
        operation: 'timeout',
      })
    }

    // Default fallback
    default: {
      throw new DatabaseException(
        error.message || 'Database operation failed',
        error,
        { ...context, prismaCode: code },
      )
    }
  }
}

/**
 * Wrap async Prisma operations with error handling
 */
export async function executePrismaQuery<T>(
  query: () => Promise<T>,
  context?: ErrorContext,
): Promise<T> {
  try {
    return await query()
  } catch (error) {
    handlePrismaError(error, context)
  }
}
