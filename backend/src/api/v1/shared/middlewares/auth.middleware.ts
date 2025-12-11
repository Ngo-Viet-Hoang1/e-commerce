import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { ACTIONS } from '../constants/rbac/actions.constant'
import { ROLES } from '../constants/rbac/roles.constant'
import { userRepository } from '../../modules/user/user.repository'
import passport from '../config/passport'
import type { AccessTokenPayload } from '../interfaces/jwt-payload.interface'
import {
  ForbiddenException,
  UnauthorizedException,
} from '../models/app-error.model'

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  passport.authenticate(
    'jwt',
    { session: false },
    (
      err: Error | null,
      user: AccessTokenPayload,
      info: {
        name?: string
        message?: string
      },
    ) => {
      if (err) {
        return next(err)
      }

      if (!user) {
        const message = getAuthErrorMessage(info)
        return next(new UnauthorizedException(message))
      }

      req.user = user
      return next()
    },
  )(req, res, next)
}

export const authorize = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user!
    const permission = `${resource}.${action}`
    const userWithRolesAndPerms =
      await userRepository.findUserWithRolesAndPerms(user.id)
    const roleIds = userWithRolesAndPerms?.userRoles.map((ur) => ur.role.id)
    const perms = userWithRolesAndPerms?.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map(
        (rp) => `${rp.permission.resource}.${rp.permission.action}`,
      ),
    )
    const isAdmin = userWithRolesAndPerms?.userRoles.some(
      (ur) => ur.role.name === ROLES.ADMIN,
    )

    if (isAdmin) {
      return next()
    }

    if (roleIds?.length === 0) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      )
    }

    if (perms?.length === 0 || !perms?.includes(permission)) {
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
    any: (...actions: string[]): RequestHandler => {
      return async (req, res, next) => {
        for (const action of actions) {
          try {
            await authorize(resource, action)(req, res, next)
            return
          } catch {
            return
          }
        }
        throw new ForbiddenException(
          'You do not have permission to perform this action',
        )
      }
    },
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
