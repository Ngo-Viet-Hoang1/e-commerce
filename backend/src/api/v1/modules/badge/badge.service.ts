import type { Prisma } from '@generated/prisma/client'
import { NotFoundException } from '../../shared/models/app-error.model'
import { badgeRepository } from './badge.repository'
import {
  type BadgeCreate,
  type BadgeListQuery,
  type BadgeUpdate,
} from './badge.schema'

class BadgeService {
  findAll = async (query: BadgeListQuery) => {
    const { page, limit, sort, order, search } = query

    const where: Prisma.BadgeWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [badges, total] = await Promise.all([
      badgeRepository.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      badgeRepository.count(where),
    ])

    return { badges, total, page, limit }
  }
  async findById(id: number) {
    const badge = await badgeRepository.findById(id)

    if (!badge) {
      throw new NotFoundException('Badge', id.toString())
    }

    return badge
  }

  create = async (data: BadgeCreate) => {
    const badge = await badgeRepository.create({
      name: data.name,
      code: data.code,
      description: data.description,
      iconUrl: data.iconUrl,
      criteria: data.criteria ?? undefined,
    })

    return badge
  }

  updateById = async (id: number, data: BadgeUpdate) => {
    const badge = await this.findById(id)
    const updateBadge = await badgeRepository.updateById(badge.id, {
      name: data.name,
      code: data.code ?? badge.code,
      description: data.description,
      iconUrl: data.iconUrl,
      criteria: data.criteria ?? undefined,
    })

    return updateBadge
  }

  deleteById = async (id: number) => {
    await this.findById(id)

    const deletedBadge = await badgeRepository.deleteById(id)
    return deletedBadge
  }
  softDeleteById = async (id: number) => {
    await this.findById(id)
    const softDeletedBrand = await badgeRepository.softDelete(id)

    return softDeletedBrand
  }

  restoreById = async (id: number) => {
    await this.findById(id)
    const restoredBrand = await badgeRepository.restore(id)

    return restoredBrand
  }
}

export const badgeService = new BadgeService()
