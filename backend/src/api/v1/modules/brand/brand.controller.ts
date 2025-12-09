import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import {
  brandSchema,
  type BrandCreate,
  type BrandIdParam,
  type BrandListQuery,
  type BrandUpdate,
} from './brand.schema'
import { brandService } from './brand.service'

class BrandController {
  findAll = async (req: Request, res: Response) => {
    const query = req.validatedData?.query as BrandListQuery
    const { brands, total, page, limit } = await brandService.findAll(query)
    const dtos = brands.map((brand) => brandSchema.parse(brand))

    SuccessResponse.paginated(
      res,
      dtos,
      { page, limit, total },
      'Brands retrieved successfully',
    )
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as BrandIdParam
    const brand = await brandService.findById(id)

    SuccessResponse.send(res, brand, 'Brand retrieved successfully')
  }

  create = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as BrandCreate
    const brand = await brandService.create(data)

    SuccessResponse.created(res, brand, 'Brand created successfully')
  }

  updateById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as BrandIdParam
    const data = req.validatedData?.body as BrandUpdate
    const updatedBrand = await brandService.updateById(id, data)

    SuccessResponse.send(res, updatedBrand, 'Brand updated successfully')
  }

  deleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as BrandIdParam
    const deletedBrand = await brandService.deleteById(id)

    SuccessResponse.send(res, deletedBrand, 'Brand deleted permanently')
  }

  softDeleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as BrandIdParam
    const softDeletedBrand = await brandService.softDeleteById(id)

    SuccessResponse.send(
      res,
      softDeletedBrand,
      'Brand soft deleted successfully',
    )
  }

  restoreById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as BrandIdParam
    const restoredBrand = await brandService.restoreById(id)

    SuccessResponse.send(res, restoredBrand, 'Brand restored successfully')
  }
}

export const brandController = new BrandController()
