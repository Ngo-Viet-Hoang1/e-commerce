import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import type {
  CreateProductBody,
  CreateSimpleProductBody,
  ListProductsQuery,
  ProductIdParam,
  UpdateProductBody,
} from './product.schema'
import { productService } from './product.service'

class ProductController {
  findAll = async (req: Request, res: Response) => {
    const query = req.validatedData?.query as ListProductsQuery

    const { products, total, page, limit } = await productService.findAll(query)

    SuccessResponse.paginated(
      res,
      products,
      { page, limit, total },
      'Products retrieved successfully',
    )
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductIdParam

    const product = await productService.findById(id)

    SuccessResponse.send(res, product, 'Product retrieved successfully')
  }

  create = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as CreateProductBody

    const product = await productService.create(data)

    SuccessResponse.created(res, product, 'Product created successfully')
  }

  updateById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductIdParam
    const data = req.validatedData?.body as UpdateProductBody

    const updatedProduct = await productService.updateById(id, data)

    SuccessResponse.send(res, updatedProduct, 'Product updated successfully')
  }

  deleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductIdParam

    const deletedProduct = await productService.deleteById(id)

    SuccessResponse.send(res, deletedProduct, 'Product deleted successfully')
  }

  softDeleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductIdParam

    const softDeletedProduct = await productService.softDeleteById(id)

    SuccessResponse.send(
      res,
      softDeletedProduct,
      'Product soft-deleted successfully',
    )
  }

  restoreById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductIdParam

    const restoredProduct = await productService.restoreById(id)

    SuccessResponse.send(res, restoredProduct, 'Product restored successfully')
  }

  createSimple = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as CreateSimpleProductBody

    const product = await productService.createSimple(data)

    SuccessResponse.created(res, product, 'Product created successfully')
  }
}

export const productController = new ProductController()
export default productController
