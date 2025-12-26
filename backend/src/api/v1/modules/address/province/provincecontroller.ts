import type { Request, Response } from 'express'
import { SuccessResponse } from '../../../shared/models/success-response.model'
import type {
  ListProvincesQuery,
  ProvinceIdParam,
  ProvinceCodeParam,
} from './province.schema'
import { provinceService } from './province.service'

class ProvinceController {
  findAll = async (req: Request, res: Response) => {
    const query = req.validatedData?.query as ListProvincesQuery
    const { provinces, total, page, limit } = await provinceService.findAll(query)

    SuccessResponse.paginated(
      res,
      provinces,
      { page, limit, total },
      'Provinces retrieved successfully',
    )
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as ProvinceIdParam

    const province = await provinceService.findById(id)

    SuccessResponse.send(res, province, 'Province retrieved successfully')
  }

  findByCode = async (req: Request, res: Response) => {
    const { code } = req.validatedData?.params as ProvinceCodeParam

    const province = await provinceService.findByCode(code)

    SuccessResponse.send(res, province, 'Province retrieved successfully')
  }

  getAll = async (_req: Request, res: Response) => {
    const provinces = await provinceService.getAll()

    SuccessResponse.send(res, provinces, 'All provinces retrieved successfully')
  }
}

export const provinceController = new ProvinceController()
export default provinceController