// Deprecated: Use global error handler middleware instead ( from Express 5.x )
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'
import AppError from '../models/app-error.model'

export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<unknown> => {
    return fn(req, res, next).catch((error) => {
      const httpError = ensureHttpError(error)
      next(httpError)
    })
  }
}

export const ensureHttpError = (error: unknown): createError.HttpError => {
  if (createError.isHttpError(error)) {
    return error
  }

  if (error instanceof Error) {
    return createError.InternalServerError(error.message)
  }

  if (typeof error === 'string') {
    return createError.InternalServerError(error)
  }

  return createError.InternalServerError('Unknown error occurred')
}

export const isOperationalError = (error: unknown): boolean => {
  return error instanceof AppError && error.isOperational
}
