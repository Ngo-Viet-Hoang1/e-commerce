import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import { dashboardService } from './dashboard.service'
import type { DashboardStatsQuery } from './dashboard.schema'

export class DashboardController {
  getStats = async (req: Request, res: Response) => {
    const validated = req.validatedData?.query as DashboardStatsQuery
    const year = validated?.year ?? new Date().getFullYear()

    const stats = await dashboardService.getStats(year)

    SuccessResponse.send(
      res,
      stats,
      'Thống kê số liệu dashboard được tải thành công',
    )
  }
}

export const dashboardController = new DashboardController()
export default dashboardController
