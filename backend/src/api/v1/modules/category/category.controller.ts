import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import type {
  CategoryIdParam,
  CategorySlugParam,
  CreateCategoryBody,
  ListCategoriesQuery,
  UpdateCategoryBody,
} from './category.schema'
import categoryService from './category.service'

class CategoryController {
  findAll = async (req: Request, res: Response) => {
    const query = req.validatedData?.query as ListCategoriesQuery

    const { categories, total, page, limit } =
      await categoryService.findAll(query)

    SuccessResponse.paginated(
      res,
      categories,
      { page, limit, total },
      'Categories retrieved successfully',
    )
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as CategoryIdParam

    const category = await categoryService.findById(id)

    SuccessResponse.send(res, category, 'Category retrieved successfully')
  }

  findBySlug = async (req: Request, res: Response) => {
    const { slug } = req.validatedData?.params as CategorySlugParam

    const category = await categoryService.findBySlug(slug)

    SuccessResponse.send(res, category, 'Category retrieved successfully')
  }

  create = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as CreateCategoryBody

    const category = await categoryService.create(data)

    SuccessResponse.created(res, category, 'Category created successfully')
  }

  updateById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as CategoryIdParam
    const data = req.validatedData?.body as UpdateCategoryBody

    const updatedCategory = await categoryService.updateById(id, data)

    SuccessResponse.send(res, updatedCategory, 'Category updated successfully')
  }

  deleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as CategoryIdParam

    const deletedCategory = await categoryService.deleteById(id)

    SuccessResponse.send(res, deletedCategory, 'Category deleted permanently')
  }

  softDeleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as CategoryIdParam

    const softDeletedCategory = await categoryService.softDeleteById(id)

    SuccessResponse.send(
      res,
      softDeletedCategory,
      'Category soft deleted successfully',
    )
  }

  restoreById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as CategoryIdParam

    const restoredCategory = await categoryService.restoreById(id)

    SuccessResponse.send(
      res,
      restoredCategory,
      'Category restored successfully',
    )
  }
}

export const categoryController = new CategoryController()
export default categoryController
