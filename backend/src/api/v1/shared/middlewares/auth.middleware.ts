import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { userRepository } from '../../modules/user/user.repository'
import passport from '../config/passport'
import { ACTIONS } from '../constants/rbac/actions.constant'
import { ROLES } from '../constants/rbac/roles.constant'
import type { AccessTokenPayload } from '../interfaces/jwt-payload.interface'
import {
  ForbiddenException,
  UnauthorizedException,
} from '../models/app-error.model'

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  passport.authenticate(
    'jwt',
    { session: false },
    async (
      err: Error | null,
      payload: AccessTokenPayload,
      info: {
        name?: string
        message?: string
      },
    ) => {
      if (err) {
        return next(err)
      }

      if (!payload) {
        const message = getAuthErrorMessage(info)
        return next(
          new UnauthorizedException(message ?? 'Authentication failed'),
        )
      }

      const userWithRolesAndPerms =
        await userRepository.findUserWithRolesAndPerms(payload.id)
      if (!userWithRolesAndPerms) {
        return next(new UnauthorizedException('User not found'))
      }

      req.userWithRolesAndPerms = userWithRolesAndPerms
      req.user = payload
      return next()
    },
  )(req, res, next)
}

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userWithRolesAndPerms = req.userWithRolesAndPerms

  if (!userWithRolesAndPerms) {
    throw new UnauthorizedException('Authentication required')
  }

  if (userWithRolesAndPerms.deletedAt || !userWithRolesAndPerms.isActive) {
    return next(new UnauthorizedException('Account is inactive'))
  }

  const isAdmin = userWithRolesAndPerms.userRoles.some(
    (ur) => ur.role.name === ROLES.ADMIN,
  )

  if (!isAdmin) throw new ForbiddenException('Admin access required')
  next()
}

export const requireUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userWithRolesAndPerms = req.userWithRolesAndPerms

  if (!userWithRolesAndPerms) {
    throw new UnauthorizedException('Authentication required')
  }

  if (userWithRolesAndPerms.deletedAt || !userWithRolesAndPerms.isActive) {
    return next(new UnauthorizedException('Account is inactive'))
  }

  const isUser = userWithRolesAndPerms.userRoles.some(
    (ur) => ur.role.name === ROLES.USER,
  )

  if (!isUser) throw new ForbiddenException('User access required')
  next()
}

export const requireRole = (...roleNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userWithRolesAndPerms = req.userWithRolesAndPerms

    if (!userWithRolesAndPerms) {
      throw new UnauthorizedException('Authentication required')
    }

    if (userWithRolesAndPerms.deletedAt || !userWithRolesAndPerms.isActive) {
      return next(new UnauthorizedException('Account is inactive'))
    }

    const hasRole = userWithRolesAndPerms.userRoles.some((ur) =>
      roleNames.includes(ur.role.name),
    )

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${roleNames.join(', ')}`,
      )
    }

    next()
  }
}

export const authorize = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userWithRolesAndPerms = req.userWithRolesAndPerms

    if (!userWithRolesAndPerms) {
      throw new UnauthorizedException('Authentication required')
    }

    const permission = `${resource}.${action}`
    const roleIds = userWithRolesAndPerms.userRoles.map((ur) => ur.role.id)
    const perms = userWithRolesAndPerms.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map(
        (rp) => `${rp.permission.resource}.${rp.permission.action}`,
      ),
    )
    const isAdmin = userWithRolesAndPerms.userRoles.some(
      (ur) => ur.role.name === ROLES.ADMIN,
    )

    if (isAdmin) return next()

    if (!roleIds || roleIds.length === 0) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      )
    }

    if (!perms || perms.length === 0 || !perms.includes(permission)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      )
    }

    next()
  }
}

export const resourceAuth = (resource: string) => {
  return {
    read: authorize(resource, ACTIONS.READ),
    create: authorize(resource, ACTIONS.CREATE),
    update: authorize(resource, ACTIONS.UPDATE),
    delete: authorize(resource, ACTIONS.DELETE),
    list: authorize(resource, ACTIONS.READ),
    manage: authorize(resource, ACTIONS.MANAGE),
    all: (...actions: string[]): RequestHandler[] => {
      return actions.map((action) => authorize(resource, action))
    },
  }
}

const methodToAction: Record<string, string> = {
  GET: ACTIONS.READ,
  POST: ACTIONS.CREATE,
  PUT: ACTIONS.UPDATE,
  PATCH: ACTIONS.UPDATE,
  DELETE: ACTIONS.DELETE,
  MANAGE: ACTIONS.MANAGE,
}

export const autoAuthorize = (resource: string): RequestHandler => {
  return (req, res, next) => {
    const action = methodToAction[req.method] || ACTIONS.READ
    return authorize(resource, action)(req, res, next)
  }
}
// router.use(autoAuthorize('user'))

function getAuthErrorMessage(info?: {
  name?: string
  message?: string
}): string {
  if (!info) return 'Authentication failed'

  switch (info.name) {
    case 'JsonWebTokenError':
      return 'Invalid token format'
    case 'TokenExpiredError':
      return 'Token has expired'
    case 'NotBeforeError':
      return 'Token not active yet'
    default:
      return info.message || 'Authentication failed'
  }
}
