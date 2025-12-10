import type { NextFunction, Request, Response } from 'express'
import passport from '../config/passport'
import type { AccessTokenPayload } from '../interfaces/jwt-payload.interface'
import { UnauthorizedException } from '../models/app-error.model'

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  passport.authenticate(
    'jwt',
    { session: false },
    (
      err: Error | null,
      user: AccessTokenPayload,
      info: {
        name?: string
        message?: string
      },
    ) => {
      if (err) {
        return next(err)
      }

      if (!user) {
        const message = getAuthErrorMessage(info)
        return next(new UnauthorizedException(message))
      }

      req.user = user
      return next()
    },
  )(req, res, next)
}

function getAuthErrorMessage(info?: {
  name?: string
  message?: string
}): string {
  if (!info) return 'Authentication failed'

  switch (info.name) {
    case 'JsonWebTokenError':
      return 'Invalid token format'
    case 'TokenExpiredError':
      return 'Token has expired'
    case 'NotBeforeError':
      return 'Token not active yet'
    default:
      return info.message || 'Authentication failed'
  }
}
