import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import type {
  GetDistrictByCodeParam,
  GetDistrictsByProvinceCodeParam,
  ListDistrictsQuery,
} from './district.schema'
import { districtService } from './district.service'

class DistrictController {
  findAll = async (req: Request, res: Response) => {
    const query = req.validatedData?.query as ListDistrictsQuery

    const { districts, total, page, limit } =
      await districtService.findAll(query)

    SuccessResponse.paginated(
      res,
      districts,
      { page, limit, total },
      'Districts retrieved successfully',
    )
  }

  findByCode = async (req: Request, res: Response) => {
    const { code } = req.validatedData?.params as GetDistrictByCodeParam

    const district = await districtService.findByCode(code)

    SuccessResponse.send(res, district, 'District retrieved successfully')
  }

  findByProvinceCode = async (req: Request, res: Response) => {
    const { provinceCode } = req.validatedData
      ?.params as GetDistrictsByProvinceCodeParam

    const districts = await districtService.findByProvinceCode(provinceCode)

    SuccessResponse.send(res, districts, 'Districts retrieved successfully')
  }
}

export const districtController = new DistrictController()
