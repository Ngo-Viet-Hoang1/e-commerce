import logger from '../config/logger'

const setupProcessHandlers = (): void => {
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

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully')
    // Close server, database connections, etc.
    process.exit(0)
  })

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully')
    process.exit(0)
  })
}

export default setupProcessHandlers
