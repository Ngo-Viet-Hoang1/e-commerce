import { Router } from 'express'
import { streamServer, type CustomChannelData } from '../shared/config/stream'
import { ROLES } from '../shared/constants/rbac'
import { authenticate } from '../shared/middlewares/auth.middleware'
import {
  ExternalServiceException,
  ForbiddenException,
} from '../shared/models/app-error.model'
import { SuccessResponse } from '../shared/models/success-response.model'
import { prisma } from '../shared/config/database/postgres'

const router = Router()

router.post('/token', authenticate, async (req, res) => {
  try {
    const user = req.userWithRolesAndPerms
    const userId = req.user?.id.toString()
    const isAdmin = user?.userRoles.some((ur) => ur.role.name === ROLES.ADMIN)

    await streamServer.upsertUser({
      id: userId!,
      name: user?.email,
      role: isAdmin ? ROLES.ADMIN : ROLES.USER,
    })

    const token = streamServer.createToken(userId!)

    SuccessResponse.send(
      res,
      {
        apiKey: process.env.STREAM_API_KEY,
        token,
        userId: userId,
        userRole: isAdmin ? ROLES.ADMIN : ROLES.USER,
      },
      'Chat token created successfully',
    )
  } catch (error) {
    throw new ExternalServiceException('Stream chat', error as Error)
  }
})

router.post('/channel', authenticate, async (req, res) => {
  try {
    const user = req.userWithRolesAndPerms
    const admin = await prisma.user.findFirst({
      where: {
        userRoles: {
          some: {
            role: { name: ROLES.ADMIN },
          },
        },
      },
    })

    if (!user?.userRoles.some((ur) => ur.role.name === ROLES.USER)) {
      throw new ForbiddenException('Only buyers can create support channels')
    }

    const channelId = `support_${user!.id}`

    const channel = streamServer.channel('messaging', channelId, {
      name: `Support - ${user?.email}`,
      members: [user!.id.toString(), admin!.id.toString()],
    } as CustomChannelData)

    await channel.create()

    SuccessResponse.send(
      res,
      { channelId },
      'Support channel created successfully',
    )
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const streamError = error as { code: number; message?: string }

      if (streamError.code === 4) {
        return SuccessResponse.send(
          res,
          { channelId: `support_${req.user!.id}` },
          'Channel already exists',
        )
      }
    }
    throw new ExternalServiceException('Stream chat', error as Error)
  }
})

export default router
