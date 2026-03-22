import { reservationService } from '@v1/modules/order/reservation'
import { connectPrisma } from '@v1/shared/config/database/postgres'
import { connectRedis } from '@v1/shared/config/database/redis'
import logger from '@v1/shared/config/logger'
import setupProcessHandlers from '@v1/shared/utils/process-handler.util'
import type { Server } from 'http'
import app from './app'

const port = process.env.PORT || 3000

async function startServer(): Promise<Server> {
  try {
    // Connect to databases
    await Promise.all([connectRedis(), connectPrisma()])

    // Start periodic cleanup for expired online payment reservations.
    reservationService.startExpirationJob()

    const server = app.listen(port, () => {
      logger.info(`🚀 Server listening at http://localhost:${port}`)
      logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
      logger.info(`🔗 API Base: http://localhost:${port}/api/v1`)
    })

    // Setup graceful shutdown with server instance
    setupProcessHandlers(server)

    return server
  } catch (error) {
    logger.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export { startServer }
