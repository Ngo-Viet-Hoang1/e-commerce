import { checkPrismaHealth } from '@/api/v1/shared/config/database/postgres'
import { checkRedisHealth } from '@/api/v1/shared/config/database/redis'
import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

router.get('/ready', async (_req, res) => {
  const checks: Record<string, boolean> = {}

  try {
    const [dbHealthy, redisHealthy] = await Promise.allSettled([
      checkPrismaHealth(),
      checkRedisHealth(),
    ])

    checks.database = dbHealthy.status === 'fulfilled' ? dbHealthy.value : false
    checks.redis =
      redisHealthy.status === 'fulfilled' ? redisHealthy.value : false

    const allHealthy = Object.values(checks).every(Boolean)

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ready' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    })
  } catch {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      checks,
    })
  }
})

export default router
