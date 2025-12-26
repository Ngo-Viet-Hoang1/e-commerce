// backend/src/api/v1/modules/address/ward/ward.controller.ts

import type { Request, Response } from 'express'
import { SuccessResponse } from '../../../shared/models/success-response.model'
import type {
  ListWardsQuery,
  WardIdParam,
  WardCodeParam,
  ProvinceCodeParam
} from './ward.schema'
import { wardService } from './ward.service'

class WardController {
  findAll = async (req: Request, res: Response) => {
    const query = req.validatedData?.query as ListWardsQuery

    const { wards, total, page, limit } = await wardService.findAll(query)

    SuccessResponse.paginated(
      res,
      wards,
      { page, limit, total },
      'Wards retrieved successfully',
    )
  }
findByProvinceCode = async (req: Request, res: Response) => {
  const { provinceCode } = req.validatedData?.params as ProvinceCodeParam

  const wards = await wardService.findByProvinceCode(provinceCode)

  SuccessResponse.send(res, wards, 'Wards of province retrieved successfully')
}
  
 findById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as WardIdParam

    const ward = await wardService.findById(id)

    SuccessResponse.send(res, ward, 'Ward retrieved successfully')
  }
  
  findByCode = async (req: Request, res: Response) => {
    const { code } = req.validatedData?.params as WardCodeParam

    const ward = await wardService.findByCode(code)

    SuccessResponse.send(res, ward, 'Ward retrieved successfully')
  }
}

export const wardController = new WardController()
export default wardController