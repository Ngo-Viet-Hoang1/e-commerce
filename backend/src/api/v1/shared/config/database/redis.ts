import Redis from 'ioredis'
import { ExternalServiceException } from '../../models/app-error.model.js'
import logger from '../logger.js'

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),

  connectTimeout: 10000,
  commandTimeout: 5000,
  keepAlive: 30000,

  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000)
    logger.warn(`Redis retry attempt ${times}, waiting ${delay}ms`)
    return delay
  },

  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  autoResubscribe: true,
  autoResendUnfulfilledCommands: true,

  lazyConnect: true,

  connectionName: process.env.SERVICE_NAME || 'api-service',
}

export const redis = new Redis(REDIS_CONFIG)

let isConnected = false
let isConnecting = false

// Event handlers
redis.on('connect', () => {
  logger.info('📡 Connecting to Redis...', {
    host: REDIS_CONFIG.host,
    port: REDIS_CONFIG.port,
    db: REDIS_CONFIG.db,
  })
})

redis.on('ready', () => {
  isConnected = true
  isConnecting = false
  logger.info('✅ Redis is ready', {
    host: REDIS_CONFIG.host,
    port: REDIS_CONFIG.port,
  })
})

redis.on('error', (err) => {
  logger.error('❌ Redis error:', {
    error: {
      message: err.message,
      stack: err.stack,
    },
    host: REDIS_CONFIG.host,
    port: REDIS_CONFIG.port,
  })
})

redis.on('close', () => {
  isConnected = false
  logger.warn('⚠️ Redis connection closed')
})

redis.on('reconnecting', (delay: number) => {
  isConnecting = true
  logger.info('🔄 Reconnecting to Redis...', {
    delay: `${delay}ms`,
    host: REDIS_CONFIG.host,
  })
})

redis.on('end', () => {
  isConnected = false
  isConnecting = false
  logger.info('🛑 Redis connection ended')
})

export async function connectRedis(): Promise<void> {
  try {
    // Check connection status
    if (redis.status === 'ready' || isConnected) {
      logger.info('Redis already connected')
      return
    }

    if (redis.status === 'connecting' || isConnecting) {
      logger.info('Redis connection in progress, waiting...')
      // Wait for connection to complete
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Redis connection timeout'))
        }, 10000)

        redis.once('ready', () => {
          clearTimeout(timeout)
          resolve()
        })

        redis.once('error', (err) => {
          clearTimeout(timeout)
          reject(err)
        })
      })
      return
    }

    isConnecting = true
    await redis.connect()
  } catch (error) {
    isConnecting = false
    logger.error('Failed to connect to Redis:', error)
    throw new ExternalServiceException(
      'Redis',
      error instanceof Error ? error : undefined,
      {
        host: REDIS_CONFIG.host,
        port: REDIS_CONFIG.port,
      },
    )
  }
}

export async function disconnectRedis(): Promise<void> {
  try {
    if (!isConnected && !isConnecting) {
      logger.info('Redis already disconnected')
      return
    }

    logger.info('Closing Redis connection...')
    await redis.quit()
    isConnected = false
    isConnecting = false
    logger.info('✅ Redis connection closed gracefully')
  } catch (error) {
    logger.error('Error closing Redis connection:', error)
    // Force close if graceful shutdown fails
    redis.disconnect(false)
  }
}

export async function checkRedisHealth(): Promise<boolean> {
  try {
    if (!isConnected) {
      return false
    }

    await redis.ping()
    return true
  } catch (error) {
    logger.error('Redis health check failed:', error)
    return false
  }
}

export default redis
