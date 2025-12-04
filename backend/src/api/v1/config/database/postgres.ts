import { PrismaClient } from '@generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'
import { Pool } from 'pg'
import { DatabaseException } from '../../models/app-error.model'
import logger from '../logger'

declare global {
  var __prisma: PrismaClient | undefined
  var __pool: Pool | undefined
}

const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: isProd ? 20 : 5,
  min: isProd ? 5 : 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  allowExitOnIdle: !isProd,
}

const createPrismaClient = (): PrismaClient => {
  const pool = globalThis.__pool ?? new Pool(poolConfig)

  if (isDev) {
    globalThis.__pool = pool
  }

  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: isDev
      ? [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' },
          { level: 'info', emit: 'stdout' },
        ]
      : isProd
        ? [
            { level: 'error', emit: 'stdout' },
            { level: 'warn', emit: 'stdout' },
          ]
        : [{ level: 'error', emit: 'stdout' }],
    errorFormat: isDev ? 'pretty' : 'minimal',
  })
}

const prisma = globalThis.__prisma ?? createPrismaClient()

if (isDev) {
  globalThis.__prisma = prisma
}

async function checkPrismaHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    logger.error('Prisma health check failed:', error)
    return false
  }
}

async function connectPrisma(): Promise<void> {
  const maxRetries = 3
  let retries = 0

  while (retries < maxRetries) {
    try {
      await prisma.$connect()
      logger.info('✅ PostgreSQL database connected successfully')

      // Test query
      const isHealthy = await checkPrismaHealth()
      if (isHealthy) {
        return
      }
    } catch (error) {
      retries++
      logger.error(
        `❌ Database connection attempt ${retries}/${maxRetries} failed:`,
        error,
      )

      if (retries >= maxRetries) {
        throw new DatabaseException(
          'Failed to connect to database after multiple retries',
          error instanceof Error ? error : undefined,
          { operation: 'connect', retries: maxRetries },
        )
      }

      const delay = Math.min(1000 * Math.pow(2, retries), 10000)
      logger.info(`⏳ Retrying in ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}

async function disconnectPrisma(): Promise<void> {
  try {
    logger.info('Disconnecting from PostgreSQL...')
    await prisma.$disconnect()
    logger.info('✅ Prisma disconnected successfully')

    if (globalThis.__pool) {
      await globalThis.__pool.end()
      logger.info('✅ Connection pool closed')
    }
  } catch (error) {
    logger.error('Error disconnecting from PostgreSQL:', error)
    throw error
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let lastError: Error | undefined

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Only retry on serialization errors or deadlocks
      const shouldRetry =
        error instanceof Error &&
        (error.message.includes('serialization') ||
          error.message.includes('deadlock'))

      if (shouldRetry && i < maxRetries - 1) {
        const delay = Math.min(100 * Math.pow(2, i), 1000)
        logger.warn(
          `Retrying transaction (${i + 1}/${maxRetries}) after ${delay}ms`,
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      throw error
    }
  }

  throw lastError
}

export async function safeTransaction<T>(
  fn: (
    tx: Omit<
      typeof prisma,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
    >,
  ) => Promise<T>,
): Promise<T> {
  return withRetry(
    () =>
      prisma.$transaction(fn, {
        maxWait: 5000,
        timeout: 30000,
        isolationLevel: 'ReadCommitted',
      }),
    3,
  )
}

export { checkPrismaHealth, connectPrisma, disconnectPrisma, prisma }

// Commands:
// - Generate client: bun prisma generate
// - Run migrations: bun prisma migrate dev
// - Open Studio: bun prisma studio
// - Push schema: bun prisma db push
