import { redis } from '../config/database/redis'
import logger from '../config/logger'

export class CacheUtil {
  private static memoryFallback = new Map<string, { value: string; expiry: number }>()

  /**
   * Get cached item by key with automatic deserialization
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      if (redis.status === 'ready') {
        const data = await redis.get(key)
        if (data) {
          return JSON.parse(data) as T
        }
        return null
      }
    } catch (err) {
      logger.warn(`Redis get failed for key "${key}", falling back to memory:`, err)
    }

    // Memory fallback
    const cached = this.memoryFallback.get(key)
    if (cached) {
      if (Date.now() > cached.expiry) {
        this.memoryFallback.delete(key)
        return null
      }
      return JSON.parse(cached.value) as T
    }

    return null
  }

  /**
   * Store item in cache with TTL (in seconds)
   */
  static async set(key: string, value: unknown, ttlSeconds = 120): Promise<void> {
    const serialized = JSON.stringify(value)

    try {
      if (redis.status === 'ready') {
        await redis.set(key, serialized, 'EX', ttlSeconds)
        return
      }
    } catch (err) {
      logger.warn(`Redis set failed for key "${key}", using memory:`, err)
    }

    // Memory fallback
    this.memoryFallback.set(key, {
      value: serialized,
      expiry: Date.now() + ttlSeconds * 1000,
    })
  }

  /**
   * Delete a single key from cache
   */
  static async del(key: string): Promise<void> {
    try {
      if (redis.status === 'ready') {
        await redis.del(key)
      }
    } catch (err) {
      logger.warn(`Redis del failed for key "${key}":`, err)
    }
    this.memoryFallback.delete(key)
  }

  /**
   * Delete keys by pattern (e.g. "admin:dashboard:*")
   */
  static async delPattern(pattern: string): Promise<void> {
    try {
      if (redis.status === 'ready') {
        const stream = redis.scanStream({ match: pattern, count: 50 })
        const keys: string[] = []

        for await (const resultKeys of stream) {
          keys.push(...resultKeys)
        }

        if (keys.length > 0) {
          await redis.del(...keys)
        }
      }
    } catch (err) {
      logger.warn(`Redis delPattern failed for pattern "${pattern}":`, err)
    }

    // Clear matching keys from memory fallback
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
    for (const k of this.memoryFallback.keys()) {
      if (regexPattern.test(k)) {
        this.memoryFallback.delete(k)
      }
    }
  }

  /**
   * Cache-Aside Pattern: Fetch from cache or compute and cache result
   */
  static async remember<T>(
    key: string,
    ttlSeconds: number,
    fetchFn: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null && cached !== undefined) {
      return cached
    }

    const freshData = await fetchFn()
    await this.set(key, freshData, ttlSeconds)
    return freshData
  }
}

export default CacheUtil
