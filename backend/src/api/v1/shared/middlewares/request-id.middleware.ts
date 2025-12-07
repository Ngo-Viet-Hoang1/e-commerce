import { randomUUID } from 'crypto'
import 'express'
import type { NextFunction, Request, Response } from 'express'

declare module 'express-serve-static-core' {
  interface Request {
    requestId: string
  }
}

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  req.requestId = randomUUID()
  res.setHeader('X-Request-ID', req.requestId)
  next()
}
