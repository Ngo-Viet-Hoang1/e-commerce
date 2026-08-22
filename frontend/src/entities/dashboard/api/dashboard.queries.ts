import { useQuery } from '@tanstack/react-query'
import AdminDashboardService from './dashboard.service'

export const useDashboardStats = (year?: number) => {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats', year],
    queryFn: () => AdminDashboardService.getStats(year),
    select: (res) => res.data,
  })
}
