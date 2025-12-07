import { connectPrisma } from '@/api/v1/shared/config/database/postgres'
import { connectRedis } from '@/api/v1/shared/config/database/redis'
import logger from '@/api/v1/shared/config/logger'
import type { Server } from 'http'
import setupProcessHandlers from './api/v1/shared/utils/process-handler.util'
import app from './app'

const port = process.env.PORT || 3000

async function startServer(): Promise<Server> {
  try {
    // Connect to databases
    await Promise.all([connectRedis(), connectPrisma()])

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
