import { adminApi } from '@/shared/api'
import type { IApiResponse } from '@/shared/types'
import type { DashboardStatsData } from '../model/dashboard.types'

export class AdminDashboardService {
  static getStats = async (year?: number) => {
    const { data } = await adminApi.get<IApiResponse<DashboardStatsData>>(
      '/admin/dashboard/stats',
      {
        params: { year },
      },
    )
    return data
  }
}

export default AdminDashboardService
