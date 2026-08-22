import { prisma } from '../../shared/config/database/postgres'
import { CacheUtil } from '../../shared/utils/cache.util'

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

export class DashboardService {
  getStats = async (year: number) => {
    const cacheKey = `admin:dashboard:stats:${year}`
    return CacheUtil.remember(cacheKey, 60, async () => {
      return this.computeStats(year)
    })
  }

  private computeStats = async (year: number) => {
    const startDate = new Date(year, 0, 1, 0, 0, 0, 0)
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999)

    // 1. Fetch available years
    const allYearsResult = await prisma.order.findMany({
      where: { deletedAt: null },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    const yearSet = new Set<number>()
    yearSet.add(new Date().getFullYear())
    allYearsResult.forEach((o: { createdAt: Date | null }) => {
      if (o.createdAt) {
        yearSet.add(new Date(o.createdAt).getFullYear())
      }
    })
    const yearOptions = Array.from(yearSet).sort((a, b) => b - a)

    // 2. Fetch orders in target year
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
                productImages: true,
              },
            },
            variant: {
              include: {
                productImages: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 3. Initialize 12 monthly slots
    const monthlyStats: MonthStat[] = Array.from({ length: 12 }, (_, monthIndex) => ({
      month: monthIndex + 1,
      monthLabel: `Tháng ${monthIndex + 1}`,
      revenue: 0,
      cost: 0,
      profit: 0,
      profitMargin: 0,
      orders: 0,
      paidOrders: 0,
      cancelledOrders: 0,
    }))

    // Maps for aggregations
    const productStatsMap = new Map<
      number,
      {
        id: number
        name: string
        sku: string
        imageUrl: string
        quantity: number
        revenue: number
        cost: number
        profit: number
      }
    >()

    const categoryStatsMap = new Map<
      number,
      {
        categoryId: number
        categoryName: string
        revenue: number
        orderCount: number
      }
    >()

    const statusCounts: Record<string, number> = {
      delivered: 0,
      shipping: 0,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
    }

    let totalRevenue = 0
    let totalCost = 0
    const totalOrders = orders.length
    let paidOrders = 0
    let cancelledOrders = 0

    // 4. Single-pass processing for maximum performance
    for (const order of orders) {
      const orderDate = new Date(order.createdAt)
      const monthIdx = orderDate.getMonth()
      const isCancelled = order.status === 'cancelled'
      const isPaymentFailed = order.paymentStatus === 'failed'
      const isPaid = order.paymentStatus === 'paid'

      // Update status distribution
      const normalizedStatus = order.status.toLowerCase()
      if (statusCounts[normalizedStatus] !== undefined) {
        statusCounts[normalizedStatus] += 1
      } else {
        statusCounts[normalizedStatus] = (statusCounts[normalizedStatus] || 0) + 1
      }

      const targetMonth = monthlyStats[monthIdx]
      if (targetMonth) {
        targetMonth.orders += 1
        if (isPaid) {
          paidOrders += 1
          targetMonth.paidOrders += 1
        }
        if (isCancelled) {
          cancelledOrders += 1
          targetMonth.cancelledOrders += 1
        }
      }

      // Calculate order revenue and COGS
      let orderRevenue = 0
      let orderCost = 0

      if (!isCancelled && !isPaymentFailed) {
        orderRevenue = Number(order.totalAmount ?? 0)

        for (const item of order.orderItems) {
          const qty = Number(item.quantity ?? 1)
          const itemPrice = Number(item.totalPrice ?? Number(item.unitPrice) * qty)
          const variantCost = item.variant?.costPrice
            ? Number(item.variant.costPrice)
            : item.variant?.price
              ? Number(item.variant.price) * 0.7
              : itemPrice * 0.7

          const itemCost = variantCost * qty
          orderCost += itemCost

          // Best seller product stats
          const productId = item.productId
          const product = item.product
          const productName = product?.name ?? `Sản phẩm #${productId}`
          const productSku = product?.sku ?? 'SKU'
          const primaryImage =
            product?.productImages?.find((img: { isPrimary: boolean; url: string }) => img.isPrimary)?.url ??
            product?.productImages?.[0]?.url ??
            item.variant?.productImages?.[0]?.url ??
            ''

          const existingP = productStatsMap.get(productId) ?? {
            id: productId,
            name: productName,
            sku: productSku,
            imageUrl: primaryImage,
            quantity: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
          }

          existingP.quantity += qty
          existingP.revenue += itemPrice
          existingP.cost += itemCost
          existingP.profit += itemPrice - itemCost
          if (!existingP.imageUrl && primaryImage) {
            existingP.imageUrl = primaryImage
          }
          productStatsMap.set(productId, existingP)

          // Category contribution stats
          const categoryId = product?.category?.id ?? 0
          const categoryName = product?.category?.name ?? 'Khác'
          const existingCat = categoryStatsMap.get(categoryId) ?? {
            categoryId,
            categoryName,
            revenue: 0,
            orderCount: 0,
          }
          existingCat.revenue += itemPrice
          existingCat.orderCount += 1
          categoryStatsMap.set(categoryId, existingCat)
        }

        totalRevenue += orderRevenue
        totalCost += orderCost

        if (targetMonth) {
          targetMonth.revenue += orderRevenue
          targetMonth.cost += orderCost
          targetMonth.profit += orderRevenue - orderCost
        }
      }
    }

    // Calculate profit margins for months
    monthlyStats.forEach((m) => {
      m.profitMargin = m.revenue > 0 ? Math.round((m.profit / m.revenue) * 100) : 0
    })

    const netProfit = totalRevenue - totalCost
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0
    const paidRate = totalOrders > 0 ? Math.round((paidOrders / totalOrders) * 100) : 0
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

    // Growth comparison (latest active month vs previous)
    const currentMonthIdx = new Date().getMonth()
    const lastMonthRev = monthlyStats[currentMonthIdx]?.revenue ?? 0
    const prevMonthRev = monthlyStats[Math.max(0, currentMonthIdx - 1)]?.revenue ?? 0
    const growthRate =
      prevMonthRev > 0
        ? Math.round(((lastMonthRev - prevMonthRev) / prevMonthRev) * 100)
        : 0

    // Top 5 Best Sellers
    const bestSellers = Array.from(productStatsMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    // Category distribution with percentages
    const categoryStats = Array.from(categoryStatsMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map((cat) => ({
        ...cat,
        percentage: totalRevenue > 0 ? Math.round((cat.revenue / totalRevenue) * 100) : 0,
      }))
      .slice(0, 5)

    // Order status percentages
    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
    }))

    // 6 Recent Orders
    const recentOrders = orders.slice(0, 6).map((o) => ({
      orderId: o.orderId,
      customerName: o.shippingRecipientName ?? o.user?.name ?? 'Khách vãng lai',
      customerEmail: o.user?.email ?? '',
      totalAmount: Number(o.totalAmount ?? 0),
      currency: o.currency ?? 'VND',
      status: o.status,
      paymentStatus: o.paymentStatus ?? 'pending',
      itemCount: o.orderItems.length,
      createdAt: o.placedAt ?? o.createdAt,
    }))

    return {
      year,
      yearOptions,
      summary: {
        totalRevenue,
        totalCost,
        netProfit,
        profitMargin,
        totalOrders,
        paidOrders,
        paidRate,
        cancelledOrders,
        avgOrderValue,
        growthRate,
        currency: 'VND',
      },
      monthlyStats,
      bestSellers,
      categoryStats,
      statusDistribution,
      recentOrders,
    }
  }
}

export const dashboardService = new DashboardService()
export default dashboardService
