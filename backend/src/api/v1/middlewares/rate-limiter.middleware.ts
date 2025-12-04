import { rateLimit } from 'express-rate-limit'

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  // store: ... , // Redis, Memcached, etc. See below.
})

// const createRateLimiter = (options: {
//   windowMs: number
//   max: number
//   message?: string
//   skipSuccessfulRequests?: boolean
//   skipFailedRequests?: boolean
// }) => {
//   const {
//     windowMs,
//     max,
//     message = 'Too many requests, please try again later',
//     skipSuccessfulRequests = false,
//     skipFailedRequests = false,
//   } = options

//   return rateLimit({
//     windowMs,
//     max,
//     message,

//     // Use Redis for distributed rate limiting
//     store: new RedisStore({
//       sendCommand: (...args: string[]) =>
//         redis.call(args[0] as string, ...args.slice(1)) as Promise<
//           number | string
//         >,
//       prefix: 'rl:', // Rate limit prefix
//     }),

//     // Standard headers (draft-8)
//     standardHeaders: 'draft-8',
//     legacyHeaders: false,

//     // Skip logic
//     skip: (req: Request) => {
//       // Skip rate limiting for trusted IPs (optional)
//       const trustedIPs = process.env.TRUSTED_IPS?.split(',') || []
//       const clientIP = req.ip || req.socket.remoteAddress || ''
//       return trustedIPs.includes(clientIP)
//     },

//     // Skip successful/failed requests
//     skipSuccessfulRequests,
//     skipFailedRequests,

//     // Custom key generator (use user ID if authenticated, IPv6 safe)
//     keyGenerator: (req: Request) => {
//       // @ts-expect-error - user may not exist on req
//       const userId = req.user?.id
//       if (userId) {
//         return `user:${userId}`
//       }
//       // IPv6-safe: use x-forwarded-for if proxied, otherwise socket address
//       const forwarded = req.headers['x-forwarded-for']
//       const ip =
//         (forwarded
//           ? forwarded.toString().split(',')[0]?.trim()
//           : req.socket.remoteAddress) || 'unknown'
//       return `ip:${ip}`
//     },

//     // Custom handler for rate limit exceeded
//     handler: (req: Request, res: Response) => {
//       const retryAfter = res.getHeader('Retry-After') as string

//       logger.warn('Rate limit exceeded', {
//         ip: req.ip,
//         path: req.path,
//         method: req.method,
//         // @ts-expect-error - user may not exist
//         userId: req.user?.id,
//         retryAfter,
//       })

//       // Throw RateLimitException để global error handler xử lý
//       const error = new RateLimitException(
//         message,
//         retryAfter ? parseInt(retryAfter, 10) : undefined,
//         {
//           ip: req.ip,
//           path: req.path,
//           requestId: req.requestId,
//         },
//       )

//       // Send error response
//       res.status(429).json({
//         success: false,
//         message: error.message,
//         status: 'fail',
//         error: {
//           code: error.code,
//           statusCode: error.statusCode,
//           category: error.category,
//           severity: error.severity,
//           details: error.details,
//         },
//         timestamp: new Date().toISOString(),
//         path: req.originalUrl,
//         method: req.method,
//         requestId: req.requestId,
//       })
//     },
//   })
// }

// /**
//  * Global rate limiter - Applied to all routes
//  * 100 requests per 15 minutes per IP/User
//  */
// export const globalRateLimiter = createRateLimiter({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
// })

// /**
//  * Strict rate limiter - For sensitive endpoints (auth, payment, etc.)
//  * 5 requests per 15 minutes per IP/User
//  */
// export const strictRateLimiter = createRateLimiter({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5,
//   message: 'Too many attempts, please try again later',
//   skipSuccessfulRequests: true, // Only count failed attempts
// })

// /**
//  * API rate limiter - For API endpoints
//  * 1000 requests per hour per IP/User
//  */
// export const apiRateLimiter = createRateLimiter({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 1000,
// })

// /**
//  * Auth rate limiter - For login/register endpoints
//  * 5 requests per 15 minutes per IP
//  */
// export const authRateLimiter = createRateLimiter({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5,
//   message: 'Too many authentication attempts, please try again later',
//   skipSuccessfulRequests: true,
// })

// export default globalRateLimiter
