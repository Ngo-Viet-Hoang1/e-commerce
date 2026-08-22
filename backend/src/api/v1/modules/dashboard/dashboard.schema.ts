import { z } from 'zod'

export const dashboardStatsQuerySchema = z.object({
  year: z
    .string()
    .optional()
    .transform((val) => {
      const parsed = val ? parseInt(val, 10) : new Date().getFullYear()
      return isNaN(parsed) ? new Date().getFullYear() : parsed
    }),
})

export type DashboardStatsQuery = z.infer<typeof dashboardStatsQuerySchema>
