import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import type {
  CreateProductSpecificationBody,
  ListProductSpecificationsQuery,
  ProductSpecificationIdParam,
  UpdateProductSpecificationBody,
  GetByProductIdParam,
  CreateMultipleByProductIdBody,
} from './product-specification.schema'
import { productSpecificationService } from './product-specification.service'

class ProductSpecificationController {
  findAll = async (req: Request, res: Response) => {
    const query = req.validatedData?.query as ListProductSpecificationsQuery

    const { specifications, total, page, limit } =
      await productSpecificationService.findAll(query)

    SuccessResponse.paginated(
      res,
      specifications,
      { page, limit, total },
      'Product specifications retrieved successfully',
    )
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductSpecificationIdParam

    const specification = await productSpecificationService.findById(id)

    SuccessResponse.send(
      res,
      specification,
      'Product specification retrieved successfully',
    )
  }

  create = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as CreateProductSpecificationBody

    const specification = await productSpecificationService.create(data)

    SuccessResponse.created(
      res,
      specification,
      'Product specification created successfully',
    )
  }

  updateById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductSpecificationIdParam
    const data = req.validatedData?.body as UpdateProductSpecificationBody

    const updatedSpecification = await productSpecificationService.updateById(
      id,
      data,
    )

    SuccessResponse.send(
      res,
      updatedSpecification,
      'Product specification updated successfully',
    )
  }

  deleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductSpecificationIdParam

    const deletedSpecification =
      await productSpecificationService.deleteById(id)

    SuccessResponse.send(
      res,
      deletedSpecification,
      'Product specification deleted successfully',
    )
  }

  softDeleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductSpecificationIdParam

    const softDeletedSpecification =
      await productSpecificationService.softDeleteById(id)

    SuccessResponse.send(
      res,
      softDeletedSpecification,
      'Product specification soft-deleted successfully',
    )
  }

  restoreById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductSpecificationIdParam

    const restoredSpecification =
      await productSpecificationService.restoreById(id)

    SuccessResponse.send(
      res,
      restoredSpecification,
      'Product specification restored successfully',
    )
  }

  findAllByProductId = async (req: Request, res: Response) => {
    const { productId } = req.validatedData?.params as GetByProductIdParam

    const specifications =
      await productSpecificationService.findAllByProductId(productId)

    SuccessResponse.send(
      res,
      specifications,
      'Product specifications retrieved successfully by product ID',
    )
  }

  createMultipleByProductId = async (req: Request, res: Response) => {
    const { productId } = req.validatedData?.params as GetByProductIdParam
    const items = req.validatedData?.body as CreateMultipleByProductIdBody

    const createdSpecifications =
      await productSpecificationService.createMultipleByProductId(
        productId,
        items,
      )

    SuccessResponse.created(
      res,
      createdSpecifications,
      'Product specifications created successfully in bulk',
    )
  }
}

export const productSpecificationController =
  new ProductSpecificationController()
export default productSpecificationController
