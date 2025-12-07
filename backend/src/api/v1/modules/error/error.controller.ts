import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'
import { ErrorCategory, ErrorCode, ErrorSeverity } from '../../shared/enums'
import { AppError } from '../../shared/models/app-error.model'

class ErrorController {
  index = (_req: Request, _res: Response, _next: NextFunction): void => {
    throw new AppError(
      'This is a custom test error',
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      ErrorCategory.INTERNAL,
      ErrorSeverity.LOW,
    )
  }

  httpError = (_req: Request, _res: Response, _next: NextFunction): void => {
    throw createError.BadRequest('This is an http-errors BadRequest')
  }
}

export const errorController = new ErrorController()
export default ErrorController
