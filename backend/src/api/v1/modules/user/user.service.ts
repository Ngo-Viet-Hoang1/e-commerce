import type { Prisma } from '@generated/prisma/client'
import { ROLES } from '../../shared/constants/rbac'
import {
  ConflictException,
  NotFoundException,
} from '../../shared/models/app-error.model'
import { PasswordUtils } from '../../shared/utils/password.util'
import { userRepository } from './user.repository'
import {
  type CreateUserBody,
  type ListUsersQuery,
  type UpdateUserBody,
} from './user.schema'

class UserService {
  findAll = async (query: ListUsersQuery) => {
    const { page, limit, sort, order, search, isActive, emailVerified } = query

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      ...(emailVerified !== undefined && { emailVerified }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [users, total] = await Promise.all([
      userRepository.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      userRepository.count(where),
    ])

    return { users, total, page, limit }
  }

  async findById(id: number) {
    const user = await userRepository.findById(id)

    if (!user) {
      throw new NotFoundException('User', id.toString())
    }

    return user
  }

  create = async (data: CreateUserBody) => {
    const emailExists = await userRepository.isEmailTaken(data.email)
    if (emailExists) {
      throw new ConflictException('Email already registered', {
        field: 'email',
        value: data.email,
      })
    }

    const hashedPassword = await PasswordUtils.hashPassword(data.password)

    const user = await userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      userRoles: {
        create: [
          {
            role: { connect: { name: ROLES.USER } },
          },
        ],
      },
    })

    return user
  }

  updateById = async (id: number, data: UpdateUserBody) => {
    await this.findById(id)

    const updatedUser = await userRepository.update(id, data)
    return updatedUser
  }

  deleteById = async (id: number) => {
    await this.findById(id)

    const deletedUser = await userRepository.delete(id)
    return deletedUser
  }

  softDeleteById = async (id: number) => {
    await this.findById(id)

    const softDeletedUser = await userRepository.softDelete(id)
    return softDeletedUser
  }

  restoreById = async (id: number) => {
    const user = await userRepository.findById(id, true)

    if (!user) {
      throw new NotFoundException('User', id.toString())
    }

    if (!user.deletedAt) {
      throw new ConflictException('User is not deleted')
    }

    const restoredUser = await userRepository.restore(id)
    return restoredUser
  }

  exists = async (id: number): Promise<boolean> => {
    return userRepository.exists(id)
  }

  findByEmail = async (email: string) => {
    const user = await userRepository.findByEmail(email)

    if (!user) {
      throw new NotFoundException('User with this email')
    }

    return user
  }
}

export const userService = new UserService()
export default UserService
