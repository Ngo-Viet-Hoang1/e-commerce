import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import {
  type BadgeCreate,
  type BadgeIdParam,
  type BadgeListQuery,
  type BadgeUpdate,
} from './badge.schema'
import { badgeService } from './badge.service'

class BadgeController {
  findAll = async (req: Request, res: Response) => {
    const query = req.validatedData?.query as BadgeListQuery
    const { badges, total, page, limit } = await badgeService.findAll(query)

    SuccessResponse.paginated(
      res,
      badges,
      { page, limit, total },
      'Badges retrieved successfully',
    )
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as BadgeIdParam

    const badge = await badgeService.findById(id)

    SuccessResponse.send(res, badge, 'Badge retrieved successfully')
  }

  create = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as BadgeCreate

    const badge = await badgeService.create(data)

    SuccessResponse.created(res, badge, 'Badge created successfully')
  }

  updateById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as BadgeIdParam
    const data = req.validatedData?.body as BadgeUpdate

    const updatedBadge = await badgeService.updateById(id, data)

    SuccessResponse.send(res, updatedBadge, 'Badge updated successfully')
  }

  deleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as BadgeIdParam

    const deletedBadge = await badgeService.deleteById(id)

    SuccessResponse.send(res, deletedBadge, 'Badge deleted permanently')
  }

  softDeleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as BadgeIdParam
    const softDeletedBadge = await badgeService.softDeleteById(id)
    SuccessResponse.send(
      res,
      softDeletedBadge,
      'Badge soft-deleted successfully',
    )
  }
  restoreById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as BadgeIdParam
    const restoredBrand = await badgeService.restoreById(id)

    SuccessResponse.send(res, restoredBrand, 'Badges restored successfully')
  }
}

export const badgeController = new BadgeController()
