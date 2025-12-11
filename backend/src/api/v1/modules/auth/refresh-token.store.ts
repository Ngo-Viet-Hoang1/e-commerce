import crypto from 'crypto'
import redis from '../../shared/config/database/redis'
import logger from '../../shared/config/logger'
import { DatabaseException } from '../../shared/models/app-error.model'
import { REFRESH_TOKEN_STATUS } from './auth.enum'

class RefreshTokenStore {
  private static readonly REFRESH_TOKEN_KEY_PREFIX = 'refreshToken:v1:'

  private static readonly USER_REFRESH_SET_PREFIX = 'user:'
  private static readonly USER_REFRESH_SET_SUFFIX = ':refreshTokens:v1'

  private static getTokenMetadataKey = (hashedToken: string): string => {
    return `${this.REFRESH_TOKEN_KEY_PREFIX}${hashedToken}`
  }

  private static getUserRefreshSetKey = (userId: number): string => {
    return `${this.USER_REFRESH_SET_PREFIX}${userId}${this.USER_REFRESH_SET_SUFFIX}`
  }

  private static getTokenUserMappingKey = (hashedToken: string): string => {
    return `${this.REFRESH_TOKEN_KEY_PREFIX}userId:${hashedToken}`
  }

  static hashToken = (token: string) => {
    const secret = process.env.REFRESH_TOKEN_SECRET || 'fallback-secret'
    return crypto.createHmac('sha256', secret).update(token).digest('hex')
  }

  static store = async (
    userId: number,
    token: string,
    opts: {
      ip?: string
      deviceId?: string
      ttlSeconds: number
    },
  ) => {
    try {
      const hashedToken = this.hashToken(token)

      const tokenMetadataKey = this.getTokenMetadataKey(hashedToken)
      const userRefreshSetKey = this.getUserRefreshSetKey(userId)
      const tokenUserMappingKey = this.getTokenUserMappingKey(hashedToken)

      const { ip = 'unknown', deviceId = 'unknown', ttlSeconds } = opts

      if (!ttlSeconds || ttlSeconds <= 0) {
        throw new DatabaseException('Invalid TTL for refresh token')
      }

      const tokenMetadata = {
        userId,
        ip,
        deviceId,
        status: REFRESH_TOKEN_STATUS.ACTIVE,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      }

      const existingSetTTL = await redis.ttl(userRefreshSetKey)
      let newSetTTL: number | null = ttlSeconds

      if (existingSetTTL === -1) {
        newSetTTL = null
      } else if (existingSetTTL > ttlSeconds) {
        newSetTTL = existingSetTTL
      }

      const pipeline = redis.pipeline()

      pipeline.setex(
        tokenMetadataKey,
        ttlSeconds,
        JSON.stringify(tokenMetadata),
      )

      pipeline.sadd(userRefreshSetKey, hashedToken)

      if (newSetTTL !== null && newSetTTL > 0) {
        pipeline.expire(userRefreshSetKey, newSetTTL)
      }

      pipeline.setex(tokenUserMappingKey, ttlSeconds, userId.toString())

      await pipeline.exec()
    } catch (error) {
      throw new DatabaseException(
        'Failed to store refresh token',
        error as Error,
      )
    }
  }

  /**
   * Check if token is valid and update lastUsedAt + refresh TT
   * If token not exist or expired→ cleanup mapping + set
   */
  static validateAndConsume = async (token: string): Promise<boolean> => {
    try {
      const hashedToken = this.hashToken(token)
      const tokenMetadataKey = this.getTokenMetadataKey(hashedToken)
      const tokenUserMappingKey = this.getTokenUserMappingKey(hashedToken)

      const metadataJson = await redis.get(tokenMetadataKey)

      if (!metadataJson) {
        const userIdStr = await redis.get(tokenUserMappingKey)
        if (userIdStr) {
          const userId = Number(userIdStr)

          logger.warn('[SECURITY] Token reuse detected ', { userId })
          await this.revokeAll(userId)
        }

        return false
      }

      const tokenMetadata = JSON.parse(metadataJson)
      if (tokenMetadata.status !== REFRESH_TOKEN_STATUS.ACTIVE) {
        return false
      }

      const pipeline = redis.pipeline()
      pipeline.del(tokenMetadataKey)
      pipeline.srem(
        this.getUserRefreshSetKey(tokenMetadata.userId),
        hashedToken,
      )
      pipeline.del(tokenUserMappingKey)
      await pipeline.exec()

      return true
    } catch (error) {
      throw new DatabaseException(
        'Failed to validate refresh token',
        error as Error,
      )
      return false
    }
  }

  static revoke = async (token: string): Promise<void> => {
    try {
      const hashedToken = this.hashToken(token)
      const tokenMetadataKey = this.getTokenMetadataKey(hashedToken)

      const metadataJson = await redis.get(tokenMetadataKey)
      if (!metadataJson) return

      const tokenMetadata = JSON.parse(metadataJson)

      const pipeline = redis.pipeline()

      pipeline.del(tokenMetadataKey)
      pipeline.srem(
        this.getUserRefreshSetKey(tokenMetadata.userId),
        hashedToken,
      )
      pipeline.del(this.getTokenUserMappingKey(hashedToken))

      await pipeline.exec()
    } catch (error) {
      throw new DatabaseException(
        'Failed to revoke refresh token',
        error as Error,
        { operation: 'revoke' },
      )
    }
  }

  static revokeAll = async (userId: number): Promise<void> => {
    try {
      const userRefreshSetKey = this.getUserRefreshSetKey(userId)
      const hashedTokens = await redis.smembers(userRefreshSetKey)

      if (!hashedTokens || hashedTokens.length === 0) {
        await redis.del(userRefreshSetKey)
        return
      }

      const pipeline = redis.pipeline()

      hashedTokens.forEach((hashed) => {
        pipeline.del(this.getTokenMetadataKey(hashed))
        pipeline.del(this.getTokenUserMappingKey(hashed))
      })

      pipeline.del(userRefreshSetKey)

      await pipeline.exec()
    } catch (error) {
      throw new DatabaseException(
        'Failed to revoke all refresh tokens',
        error as Error,
      )
    }
  }
}

export default RefreshTokenStore
