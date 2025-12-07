import cors from 'cors'
import type { CorsOptions } from 'cors'
import { ForbiddenException } from '../models/app-error.model.js'

const getAllowedOrigins = (): string[] => {
  const corsOrigin = process.env.CORS_ORIGIN

  if (!corsOrigin) {
    return [
      'http://localhost:3000', // React default
      'http://localhost:3001', // Alternative React port
      'http://localhost:5173', // Vite default
      'http://localhost:5174', // Alternative Vite port
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
    ]
  }

  // Parse comma-separated origins
  return corsOrigin.split(',').map((origin) => origin.trim())
}

const isProduction = process.env.NODE_ENV === 'production'

const baseCorsOptions: CorsOptions = {
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
    'X-API-Key',
  ],

  exposedHeaders: [
    'X-Request-ID',
    'X-Total-Count',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
}

const developmentCorsOptions: CorsOptions = {
  ...baseCorsOptions,
  origin: true, // Allow all origins in development
  credentials: true,
}

const productionCorsOptions: CorsOptions = {
  ...baseCorsOptions,
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins()

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true)
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(
      new ForbiddenException(`Origin ${origin} is not allowed by CORS policy`, {
        origin,
        allowedOrigins,
      }),
    )
  },
}

/**
 * Default CORS middleware for API routes
 * - Development: Allow all origins
 * - Production: Validate against CORS_ORIGIN env variable
 */
export const corsMiddleware = cors(
  isProduction ? productionCorsOptions : developmentCorsOptions,
)

/**
 * Strict CORS middleware - No cross-origin requests allowed
 * Use for sensitive endpoints that should only be accessed from same origin
 */
export const strictCorsMiddleware = cors({
  ...baseCorsOptions,
  origin: false,
  credentials: false,
})

/**
 * Public CORS middleware - Allow all origins without credentials
 * Use for public API endpoints (health checks, public data, etc.)
 */
export const publicCorsMiddleware = cors({
  ...baseCorsOptions,
  origin: true,
  credentials: false,
})

export default corsMiddleware
