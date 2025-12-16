import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import type {
  ListProductBadgesQuery,
  ProductBadgeCreate,
  ProductBadgeParam,
} from './product-badge.schema'
import { productBadgeService } from './product-badge.service'

class ProductBadgeController {
  findAll = async (req: Request, res: Response) => {
    const query = req.validatedData?.query as ListProductBadgesQuery

    const { productBadges, total, page, limit } =
      await productBadgeService.findAll(query)

    SuccessResponse.paginated(
      res,
      productBadges,
      { page, limit, total },
      'Product badges retrieved successfully',
    )
  }

  create = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as ProductBadgeCreate

    const productBadge = await productBadgeService.create(data)

    SuccessResponse.created(
      res,
      productBadge,
      'Product badge created successfully',
    )
  }

  delete = async (req: Request, res: Response) => {
    const { productId, badgeId } = req.validatedData
      ?.params as ProductBadgeParam

    const deletedProductBadge = await productBadgeService.delete(
      productId,
      badgeId,
    )

    SuccessResponse.send(
      res,
      deletedProductBadge,
      'Product badge deleted successfully',
    )
  }

  softDelete = async (req: Request, res: Response) => {
    const { productId, badgeId } = req.validatedData
      ?.params as ProductBadgeParam

    const softDeletedProductBadge = await productBadgeService.softDelete(
      productId,
      badgeId,
    )

    SuccessResponse.send(
      res,
      softDeletedProductBadge,
      'Product badge soft-deleted successfully',
    )
  }

  restore = async (req: Request, res: Response) => {
    const { productId, badgeId } = req.validatedData
      ?.params as ProductBadgeParam

    const restoredProductBadge = await productBadgeService.restore(
      productId,
      badgeId,
    )

    SuccessResponse.send(
      res,
      restoredProductBadge,
      'Product badge restored successfully',
    )
  }
}

export const productBadgeController = new ProductBadgeController()
export default ProductBadgeController
