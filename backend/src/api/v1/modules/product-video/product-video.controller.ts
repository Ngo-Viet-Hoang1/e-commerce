import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import type {
  CreateProductVideoBody,
  ListProductVideosQuery,
  ProductVideoIdParam,
} from './product-video.schema'
import { productVideoService } from './product-video.service'

class ProductVideoController {
  findAll = async (req: Request, res: Response) => {
    const query = req.validatedData?.query as ListProductVideosQuery
    const { videos, total, page, limit } =
      await productVideoService.findAll(query)

    SuccessResponse.paginated(res, videos, { page, limit, total }, '')
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductVideoIdParam
    const video = await productVideoService.findById(id)

    SuccessResponse.send(res, video, 'Product video retrieved successfully')
  }

  create = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as CreateProductVideoBody
    const video = await productVideoService.create(data)

    SuccessResponse.created(res, video, 'Product video created successfully')
  }

  deleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductVideoIdParam
    const deletedVideo = await productVideoService.deleteById(id)

    SuccessResponse.send(
      res,
      deletedVideo,
      'Product video deleted successfully',
    )
  }

  softDeleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductVideoIdParam
    const softDeletedVideo = await productVideoService.softDeleteById(id)

    SuccessResponse.send(
      res,
      softDeletedVideo,
      'Product video soft-deleted successfully',
    )
  }

  restoreById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductVideoIdParam
    const restoredVideo = await productVideoService.restoreById(id)

    SuccessResponse.send(
      res,
      restoredVideo,
      'Product video restored successfully',
    )
  }
}

export const productVideoController = new ProductVideoController()
export default ProductVideoController
