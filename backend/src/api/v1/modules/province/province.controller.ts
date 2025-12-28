import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import type {
  GetProvinceByCodeParam,
  ListProvincesQuery,
} from './province.schema'
import { provinceService } from './province.service'

class ProvinceController {
  findAll = async (req: Request, res: Response) => {
    const query = req.validatedData?.query as ListProvincesQuery

    const { provinces, total, page, limit } =
      await provinceService.findAll(query)

    SuccessResponse.paginated(
      res,
      provinces,
      { page, limit, total },
      'Provinces retrieved successfully',
    )
  }

  findByCode = async (req: Request, res: Response) => {
    const { code } = req.validatedData?.params as GetProvinceByCodeParam

    const province = await provinceService.findByCode(code)

    SuccessResponse.send(res, province, 'Province retrieved successfully')
  }
}

export const provinceController = new ProvinceController()
