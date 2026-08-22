export interface MonthStat {
  month: number
  monthLabel: string
  revenue: number
  cost: number
  profit: number
  profitMargin: number
  orders: number
  paidOrders: number
  cancelledOrders: number
}

export interface BestSellerProduct {
  id: number
  name: string
  sku: string
  imageUrl: string
  quantity: number
  revenue: number
  cost: number
  profit: number
}

export interface CategoryStat {
  categoryId: number
  categoryName: string
  revenue: number
  orderCount: number
  percentage: number
}

export interface StatusDistribution {
  status: string
  count: number
  percentage: number
}

export interface RecentOrder {
  orderId: number
  customerName: string
  customerEmail: string
  totalAmount: number
  currency: string
  status: string
  paymentStatus: string
  itemCount: number
  createdAt: string | Date
}

export interface DashboardSummary {
  totalRevenue: number
  totalCost: number
  netProfit: number
  profitMargin: number
  totalOrders: number
  paidOrders: number
  paidRate: number
  cancelledOrders: number
  avgOrderValue: number
  growthRate: number
  currency: string
}

export interface DashboardStatsData {
  year: number
  yearOptions: number[]
  summary: DashboardSummary
  monthlyStats: MonthStat[]
  bestSellers: BestSellerProduct[]
  categoryStats: CategoryStat[]
  statusDistribution: StatusDistribution[]
  recentOrders: RecentOrder[]
}
