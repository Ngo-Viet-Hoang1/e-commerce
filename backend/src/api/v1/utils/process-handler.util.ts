import type { Server } from 'http'
import { disconnectPrisma } from '../config/database/postgres.js'
import { disconnectRedis } from '../config/database/redis.js'
import logger from '../config/logger'

const setupProcessHandlers = (server?: Server): void => {
  process.on(
    'unhandledRejection',
    (reason: unknown, promise: Promise<unknown>) => {
      logger.error('Unhandled Promise Rejection', {
        reason,
        promise,
        severity: 'critical',
        category: 'internal',
      })

      process.exit(1)
    },
  )

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      severity: 'critical',
      category: 'internal',
    })

    process.exit(1)
  })

  const gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`)

    try {
      // Close HTTP server first (stop accepting new requests)
      if (server) {
        await new Promise<void>((resolve, reject) => {
          server.close((err) => {
            if (err) {
              logger.error('Error closing HTTP server:', err)
              reject(err)
            } else {
              logger.info('✅ HTTP server closed')
              resolve()
            }
          })
        })
      }

      // Close database connections
      await disconnectRedis()
      await disconnectPrisma()

      logger.info('✅ Graceful shutdown completed')
      process.exit(0)
    } catch (error) {
      logger.error('Error during graceful shutdown:', error)
      process.exit(1)
    }
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
}

export default setupProcessHandlers
