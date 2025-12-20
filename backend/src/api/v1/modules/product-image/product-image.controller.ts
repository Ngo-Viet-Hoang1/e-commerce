import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import type {
  CreateProductImageBody,
  ListProductImagesQuery,
  ProductImageIdParam,
} from './product-image.schema'
import { productImageService } from './product-image.service'

class ProductImageController {
  findAll = async (req: Request, res: Response) => {
    const query = req.validatedData?.query as ListProductImagesQuery
    const { images, total, page, limit } =
      await productImageService.findAll(query)

    SuccessResponse.paginated(res, images, { page, limit, total }, '')
  }
  findById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductImageIdParam
    const image = await productImageService.findById(id)

    SuccessResponse.send(res, image, 'Product image retrieved successfully')
  }
  create = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as CreateProductImageBody
    const image = await productImageService.create(data)
    SuccessResponse.created(res, image, 'Product image created successfully')
  }
  deleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductImageIdParam
    const deletedImage = await productImageService.deleteById(id)
    SuccessResponse.send(
      res,
      deletedImage,
      'Product image deleted successfully',
    )
  }
  softDeleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductImageIdParam
    const softDeletedImage = await productImageService.softDeleteById(id)
    SuccessResponse.send(
      res,
      softDeletedImage,
      'Product image soft-deleted successfully',
    )
  }
  restoreById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductImageIdParam
    const restoredImage = await productImageService.restoreById(id)
    SuccessResponse.send(
      res,
      restoredImage,
      'Product image restored successfully',
    )
  }
}

export const productImageController = new ProductImageController()
export default ProductImageController
