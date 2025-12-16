import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import {
  type CreateProductVariantBody,
  type ListProductVariantsQuery,
  type ProductVariantIdParam,
  type UpdateProductVariantBody,
} from './product-variant.schema'
import { productVariantService } from './product-variant.service'

class ProductVariantController {
  findAll = async (req: Request, res: Response) => {
    const query = req.validatedData?.query as ListProductVariantsQuery

    const {
      shapedProductVariants: productVariants,
      total,
      page,
      limit,
    } = await productVariantService.findAll(query)

    SuccessResponse.paginated(
      res,
      productVariants,
      { page, limit, total },
      'Product variants retrieved successfully',
    )
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductVariantIdParam

    const productVariant = await productVariantService.findById(id)

    SuccessResponse.send(
      res,
      productVariant,
      'Product variant retrieved successfully',
    )
  }

  create = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as CreateProductVariantBody

    const productVariant = await productVariantService.create(data)

    SuccessResponse.created(
      res,
      productVariant,
      'Product variant created successfully',
    )
  }

  updateById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductVariantIdParam
    const data = req.validatedData?.body as UpdateProductVariantBody

    const updatedProductVariant = await productVariantService.updateById(
      id,
      data,
    )

    SuccessResponse.send(
      res,
      updatedProductVariant,
      'Product variant updated successfully',
    )
  }

  deleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductVariantIdParam

    const deletedProductVariant = await productVariantService.deleteById(id)

    SuccessResponse.send(
      res,
      deletedProductVariant,
      'Product variant deleted permanently',
    )
  }

  softDeleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductVariantIdParam

    const deletedProductVariant = await productVariantService.softDeleteById(id)

    SuccessResponse.send(
      res,
      deletedProductVariant,
      'Product variant soft deleted successfully',
    )
  }

  restoreById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductVariantIdParam

    const restoredProductVariant = await productVariantService.restoreById(id)

    SuccessResponse.send(
      res,
      restoredProductVariant,
      'Product variant restored successfully',
    )
  }
}

export const productVariantController = new ProductVariantController()
export default ProductVariantController
