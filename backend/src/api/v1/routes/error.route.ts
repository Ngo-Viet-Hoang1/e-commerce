import express from 'express'
import createError from 'http-errors'
import { errorController } from '../modules/error/error.controller'
import {
  ConflictException,
  ForbiddenException,
  InternalServerException,
  NotFoundException,
  RateLimitException,
  UnauthorizedException,
  ValidationException,
} from '../shared/models/app-error.model'

const router = express.Router()

router.get('/', errorController.index)
router.get('/http-error', errorController.httpError)

router.get('/http-error-501', (_req, res, next) => {
  next(createError(417, 'I am a teapot'))
})

router.get('/async-error', async (__req, _res, _next) => {
  // Simulate async operation that fails with http-errors
  await new Promise((resolve, reject) => {
    setTimeout(
      () =>
        reject(
          new InternalServerException(
            'Async operation failed',
            new Error('DB error'),
          ),
        ),
      99,
    )
  })
})

router.get('/not-found-error', (_req, _res, _next) => {
  throw new NotFoundException('The _requested resource was not found')
})

router.get('/error-types/validation', (_req, _res, _next) => {
  throw new ValidationException({
    email: ['Email is _required', 'Email must be a valid email address'],
    password: [
      'Password is _required',
      'Password must be at least 8 characters',
    ],
  })
})

router.get('/error-types/unauthorized', (_req, _res, _next) => {
  throw new UnauthorizedException(
    'You must be logged in to access this resource',
  )
})

router.get('/error-types/forbidden', (_req, _res, _next) => {
  throw new ForbiddenException('Access denied to admin area')
})

router.get('/error-types/conflict', (_req, _res, _next) => {
  throw new ConflictException('Email already exists')
})

router.get('/error-types/rate-limit', (_req, _res, _next) => {
  throw new RateLimitException('Too many login attempts')
})

export default router
