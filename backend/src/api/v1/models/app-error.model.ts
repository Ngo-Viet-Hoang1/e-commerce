import { ErrorCategory, ErrorCode, ErrorSeverity } from '../enums/index.js'
import type { ErrorContext } from '../interfaces/error.interface.js'

export class AppError extends Error {
  public readonly statusCode: number
  public readonly errorStatus: 'fail' | 'error'
  public readonly code: ErrorCode
  public readonly category: ErrorCategory
  public readonly severity: ErrorSeverity
  public readonly isOperational: boolean
  public readonly context?: ErrorContext
  public readonly details?: unknown

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    category: ErrorCategory,
    severity: ErrorSeverity,
    details?: unknown,
    context?: ErrorContext,
  ) {
    super(message)

    this.name = this.constructor.name
    this.statusCode = statusCode
    this.errorStatus = statusCode >= 500 ? 'error' : 'fail'
    this.code = code
    this.category = category
    this.severity = severity
    this.isOperational = true
    this.details = details
    this.context = context

    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      code: this.code,
      category: this.category,
      severity: this.severity,
      details: this.details,
      context: this.context,
    }
  }
}

export class BadRequestException extends AppError {
  constructor(
    message = 'Bad Request',
    details?: unknown,
    context?: ErrorContext,
  ) {
    super(
      message,
      400,
      ErrorCode.BAD_REQUEST,
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      details,
      context,
    )
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = 'Unauthorized', context?: ErrorContext) {
    super(
      message,
      401,
      ErrorCode.UNAUTHORIZED,
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.MEDIUM,
      undefined,
      context,
    )
  }
}

export class ForbiddenException extends AppError {
  constructor(message = 'Forbidden', context?: ErrorContext) {
    super(
      message,
      403,
      ErrorCode.FORBIDDEN,
      ErrorCategory.AUTHORIZATION,
      ErrorSeverity.MEDIUM,
      undefined,
      context,
    )
  }
}

export class NotFoundException extends AppError {
  constructor(resource = 'Resource', id?: string, context?: ErrorContext) {
    const message = id
      ? `${resource} with id ${id} not found`
      : `${resource} not found`
    super(
      message,
      404,
      ErrorCode.NOT_FOUND,
      ErrorCategory.NOT_FOUND,
      ErrorSeverity.LOW,
      undefined,
      { ...context, resource, resourceId: id },
    )
  }
}

export class ValidationException extends AppError {
  constructor(details: Record<string, string[]>, context?: ErrorContext) {
    super(
      'Validation failed',
      400,
      ErrorCode.VALIDATION_ERROR,
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      details,
      context,
    )
  }
}

export class ConflictException extends AppError {
  constructor(
    message = 'Resource already exists',
    details?: unknown,
    context?: ErrorContext,
  ) {
    super(
      message,
      409,
      ErrorCode.CONFLICT,
      ErrorCategory.CONFLICT,
      ErrorSeverity.LOW,
      details,
      context,
    )
  }
}

export class RateLimitException extends AppError {
  constructor(
    message = 'Rate limit exceeded',
    retryAfter?: number,
    context?: ErrorContext,
  ) {
    super(
      message,
      429,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      ErrorCategory.RATE_LIMIT,
      ErrorSeverity.MEDIUM,
      { retryAfter },
      context,
    )
  }
}

export class InternalServerException extends AppError {
  constructor(
    message = 'Internal Server Error',
    error?: Error,
    context?: ErrorContext,
  ) {
    super(
      message,
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      ErrorCategory.INTERNAL,
      ErrorSeverity.CRITICAL,
      error?.message,
      context,
    )
  }
}

export class DatabaseException extends AppError {
  constructor(
    message = 'Database error',
    error?: Error,
    context?: ErrorContext,
  ) {
    super(
      message,
      500,
      ErrorCode.DATABASE_ERROR,
      ErrorCategory.DATABASE,
      ErrorSeverity.HIGH,
      error?.message,
      context,
    )
  }
}

export class ExternalServiceException extends AppError {
  constructor(serviceName: string, error?: Error, context?: ErrorContext) {
    super(
      `External service ${serviceName} is unavailable`,
      503,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      ErrorCategory.EXTERNAL_SERVICE,
      ErrorSeverity.HIGH,
      error?.message,
      { ...context, serviceName },
    )
  }
}
