import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import type {
  CreateProductFaqBody,
  ListProductFaqsQuery,
  ProductFaqIdParam,
  UpdateProductFaqBody,
} from './product-faq.schema'
import { productFaqService } from './product-faq.service'

class ProductFaqController {
  findAll = async (req: Request, res: Response) => {
    const query = req.validatedData?.query as ListProductFaqsQuery

    const { productFaqs, total, page, limit } =
      await productFaqService.findAll(query)

    SuccessResponse.paginated(res, productFaqs, { page, limit, total }, '')
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductFaqIdParam

    const productFaq = await productFaqService.findById(id)

    SuccessResponse.send(res, productFaq, 'Product FAQ retrieved successfully')
  }

  create = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as CreateProductFaqBody

    const productFaq = await productFaqService.create(data)

    SuccessResponse.created(res, productFaq, 'Product FAQ created successfully')
  }

  updatebyId = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductFaqIdParam
    const data = req.validatedData?.body as UpdateProductFaqBody

    const updatedProductFaq = await productFaqService.updateById(id, data)

    SuccessResponse.send(
      res,
      updatedProductFaq,
      'Product FAQ updated successfully',
    )
  }

  deleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductFaqIdParam

    const deletedProductFaq = await productFaqService.deleteById(id)

    SuccessResponse.send(
      res,
      deletedProductFaq,
      'Product FAQ deleted successfully',
    )
  }

  softDeleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductFaqIdParam

    const softDeletedProductFaq = await productFaqService.softDeleteById(id)

    SuccessResponse.send(
      res,
      softDeletedProductFaq,
      'Product FAQ soft deleted successfully',
    )
  }

  restoreById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProductFaqIdParam

    const restoredProductFaq = await productFaqService.restoreById(id)

    SuccessResponse.send(
      res,
      restoredProductFaq,
      'Product FAQ restored successfully',
    )
  }
}

export const productFaqController = new ProductFaqController()
export default ProductFaqController
