/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextFunction, Request, Response } from 'express'
import logger from '../config/logger.js'
import { ErrorCategory, ErrorCode, ErrorSeverity } from '../enums/index.js'
import type { IErrorResponse } from '../interfaces/base-response.interface.js'
import type { ErrorLogPayload } from '../interfaces/error.interface.js'
import { AppError, NotFoundException } from '../models/app-error.model'

export const globalErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = 500
  let message = 'Internal Server Error'
  let status: 'fail' | 'error' = 'error'
  let code = ErrorCode.INTERNAL_SERVER_ERROR
  let category = ErrorCategory.INTERNAL
  let severity = ErrorSeverity.CRITICAL
  let details: unknown = undefined
  let context: Record<string, unknown> | undefined = undefined

  if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
    status = err.errorStatus
    code = err.code
    category = err.category
    severity = err.severity
    details = err.details
    context = err.context
  }
  // Handle known error types (mongoose, jwt, etc.)
  else {
    const errorMapping = getErrorMapping(err)
    statusCode = errorMapping.statusCode
    message = errorMapping.message
    status = errorMapping.status
    code = errorMapping.code
    category = errorMapping.category
    severity = errorMapping.severity
  }

  const logPayload: ErrorLogPayload = {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code,
      category,
      severity,
    },
    request: {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
    user: {
      id: (req as any).user?.id || 'Guest',
      email: (req as any).user?.email || 'N/A',
    },
    timestamp: new Date().toISOString(),
  }

  logger.error('Error occurred:', logPayload)

  const errorResponse: IErrorResponse = {
    success: false,
    message,
    status,
    error: {
      code,
      statusCode,
      category,
      severity,
      ...(details !== undefined && { details }),
      ...(context && { context }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    requestId: req.requestId,
  }

  res.status(statusCode).json(errorResponse)
}

function getErrorMapping(err: Error): {
  statusCode: number
  message: string
  status: 'fail' | 'error'
  code: ErrorCode
  category: ErrorCategory
  severity: ErrorSeverity
} {
  const mappings: Record<
    string,
    {
      statusCode: number
      message: string
      status: 'fail' | 'error'
      code: ErrorCode
      category: ErrorCategory
      severity: ErrorSeverity
    }
  > = {
    ValidationError: {
      statusCode: 400,
      message: 'Validation Error',
      status: 'fail',
      code: ErrorCode.VALIDATION_ERROR,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
    },
    CastError: {
      statusCode: 400,
      message: 'Invalid ID format',
      status: 'fail',
      code: ErrorCode.BAD_REQUEST,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
    },
    JsonWebTokenError: {
      statusCode: 401,
      message: 'Invalid token',
      status: 'fail',
      code: ErrorCode.UNAUTHORIZED,
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.MEDIUM,
    },
    TokenExpiredError: {
      statusCode: 401,
      message: 'Token expired',
      status: 'fail',
      code: ErrorCode.UNAUTHORIZED,
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.MEDIUM,
    },
    // Prisma errors
    PrismaClientKnownRequestError: {
      statusCode: 400,
      message: 'Database request error',
      status: 'fail',
      code: ErrorCode.DATABASE_ERROR,
      category: ErrorCategory.DATABASE,
      severity: ErrorSeverity.HIGH,
    },
    PrismaClientUnknownRequestError: {
      statusCode: 500,
      message: 'Unknown database error',
      status: 'error',
      code: ErrorCode.DATABASE_ERROR,
      category: ErrorCategory.DATABASE,
      severity: ErrorSeverity.CRITICAL,
    },
    PrismaClientValidationError: {
      statusCode: 400,
      message: 'Database validation error',
      status: 'fail',
      code: ErrorCode.VALIDATION_ERROR,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
    },
    PrismaClientInitializationError: {
      statusCode: 503,
      message: 'Database connection failed',
      status: 'error',
      code: ErrorCode.DATABASE_ERROR,
      category: ErrorCategory.DATABASE,
      severity: ErrorSeverity.CRITICAL,
    },
  }

  return (
    mappings[err.name] || {
      statusCode: 500,
      message: err.message || 'Internal Server Error',
      status: 'error',
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      category: ErrorCategory.INTERNAL,
      severity: ErrorSeverity.CRITICAL,
    }
  )
}

export const notFoundHandler = (
  req: Request,
  _res: Response,
  _next: NextFunction,
): void => {
  throw new NotFoundException('Route', req.originalUrl)
}
