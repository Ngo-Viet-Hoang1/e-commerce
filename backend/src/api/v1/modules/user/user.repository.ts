import type { Prisma } from '@generated/prisma/client'
import { prisma } from '../../shared/config/database/postgres'
import { executePrismaQuery } from '../../shared/utils/prisma-error.util'

export const USER_SELECT_FIELDS = {
  id: true,
  email: true,
  name: true,
  googleId: true,
  isActive: true,
  isMfaActive: true,
  emailVerified: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const satisfies Prisma.UserSelect

export const USER_SELECT_FOR_AUTH = {
  ...USER_SELECT_FIELDS,
  password: true,
  twoFactorSecret: true,
} as const satisfies Prisma.UserSelect

class UserRepository {
  findById = async (id: number, includeDeleted = false) => {
    return executePrismaQuery(() =>
      prisma.user.findUnique({
        where: {
          id,
          ...(includeDeleted ? {} : { deletedAt: null }),
        },
        select: USER_SELECT_FIELDS,
      }),
    )
  }

  findRolesByUserId = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.user.findUnique({
        where: { id },
        select: {
          userRoles: {
            select: { role: { select: { id: true, name: true } } },
          },
        },
      }),
    )
  }

  findByEmail = async (email: string) => {
    return executePrismaQuery(() =>
      prisma.user.findUnique({
        where: { email },
        select: USER_SELECT_FIELDS,
      }),
    )
  }

  findByEmailForAuth = async (email: string) => {
    return executePrismaQuery(() =>
      prisma.user.findUnique({
        where: { email },
        select: USER_SELECT_FOR_AUTH,
      }),
    )
  }

  findMany = async (params: {
    where?: Prisma.UserWhereInput
    orderBy?: Prisma.UserOrderByWithRelationInput
    skip?: number
    take?: number
  }) => {
    return executePrismaQuery(() =>
      prisma.user.findMany({
        ...params,
        select: USER_SELECT_FIELDS,
      }),
    )
  }

  count = async (where?: Prisma.UserWhereInput) => {
    return executePrismaQuery(() => prisma.user.count({ where }))
  }

  create = async (data: Prisma.UserCreateInput) => {
    return executePrismaQuery(() =>
      prisma.user.create({
        data,
        select: USER_SELECT_FIELDS,
      }),
    )
  }

  update = async (id: number, data: Prisma.UserUpdateInput) => {
    return executePrismaQuery(() =>
      prisma.user.update({
        where: { id },
        data,
        select: USER_SELECT_FIELDS,
      }),
    )
  }

  delete = async (id: number) => {
    return executePrismaQuery(() =>
      prisma.user.delete({
        where: { id },
        select: USER_SELECT_FIELDS,
      }),
    )
  }

  softDelete = async (id: number) => {
    return this.update(id, { deletedAt: new Date() })
  }

  restore = async (id: number) => {
    return this.update(id, { deletedAt: null })
  }

  exists = async (id: number): Promise<boolean> => {
    const count = await executePrismaQuery(() =>
      prisma.user.count({ where: { id, deletedAt: null } }),
    )
    return count > 0
  }

  isEmailTaken = async (
    email: string,
    excludeUserId?: number,
  ): Promise<boolean> => {
    const count = await executePrismaQuery(() =>
      prisma.user.count({
        where: {
          email,
          ...(excludeUserId && { id: { not: excludeUserId } }),
          deletedAt: null,
        },
      }),
    )
    return count > 0
  }
}

export const userRepository = new UserRepository()
export default UserRepository
