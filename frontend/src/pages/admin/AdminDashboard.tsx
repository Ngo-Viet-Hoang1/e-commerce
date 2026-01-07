import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import AdminOrderService from '@/api/services/admin/order.admin.service'
import AdminProductService from '@/api/services/admin/product.admin.service'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Order } from '@/interfaces/order.interface'
import {
  getOrderStatusColor,
  getOrderStatusLabel,
} from '@/constants/order.constants'
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
} from '@/lib/format'

const DASHBOARD_ORDERS_LIMIT = 500

const monthLabels = Array.from(
  { length: 12 },
  (_, index) => `Tháng ${index + 1}`,
)

const getOrderDate = (order: Order) => {
  const rawDate = order.placedAt ?? order.createdAt
  return rawDate ? new Date(rawDate) : null
}

const getOrderTotal = (order: Order) => {
  if (order.totalAmount !== null && order.totalAmount !== undefined) {
    return Number(order.totalAmount) || 0
  }

  const subtotal =
    order.orderItems?.reduce(
      (sum, item) => sum + Number(item.totalPrice ?? 0),
      0,
    ) ?? 0
  const shippingFee = Number(order.shippingFee ?? 0)

  return subtotal + shippingFee
}

const AdminDashboard = () => {
  const [selectedYear, setSelectedYear] = useState(() =>
    new Date().getFullYear(),
  )

  const ordersQuery = useQuery({
    queryKey: [
      'admin',
      'dashboard',
      'orders',
      { limit: DASHBOARD_ORDERS_LIMIT },
    ],
    queryFn: () =>
      AdminOrderService.getPaginated({
        page: 1,
        limit: DASHBOARD_ORDERS_LIMIT,
        sort: 'createdAt',
        order: 'desc',
      }),
    select: (response) => response.data ?? [],
  })

  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data])

  const yearOptions = useMemo(() => {
    const years = new Set<number>()
    orders.forEach((order) => {
      const date = getOrderDate(order)
      if (date) years.add(date.getFullYear())
    })

    if (years.size === 0) {
      years.add(new Date().getFullYear())
    }

    return Array.from(years).sort((a, b) => b - a)
  }, [orders])

  const safeSelectedYear = yearOptions.includes(selectedYear)
    ? selectedYear
    : yearOptions[0]

  const monthlyStats = useMemo(() => {
    const stats = Array.from({ length: 12 }, (_, month) => ({
      month,
      orders: 0,
      paidOrders: 0,
      cancelledOrders: 0,
      revenue: 0,
      currency: 'VND',
    }))

    orders.forEach((order) => {
      const date = getOrderDate(order)
      if (!date || date.getFullYear() !== safeSelectedYear) return

      const index = date.getMonth()
      const totalAmount = Number(order.totalAmount) || 0

      stats[index].orders += 1
      stats[index].revenue += totalAmount
      stats[index].currency = order.currency ?? stats[index].currency

      if (order.paymentStatus === 'paid') {
        stats[index].paidOrders += 1
      }

      if (order.status === 'cancelled') {
        stats[index].cancelledOrders += 1
      }
    })

    return stats
  }, [orders, safeSelectedYear])

  const yearSummary = useMemo(() => {
    return monthlyStats.reduce(
      (acc, item) => ({
        revenue: acc.revenue + item.revenue,
        orders: acc.orders + item.orders,
        paidOrders: acc.paidOrders + item.paidOrders,
        cancelledOrders: acc.cancelledOrders + item.cancelledOrders,
        currency: item.currency || acc.currency,
      }),
      {
        revenue: 0,
        orders: 0,
        paidOrders: 0,
        cancelledOrders: 0,
        currency: 'VND',
      },
    )
  }, [monthlyStats])

  const chartMax = Math.max(1, ...monthlyStats.map((item) => item.revenue))

  const revenueTotal = monthlyStats.reduce((sum, item) => sum + item.revenue, 0)
  const lastMonthRevenue = monthlyStats[monthlyStats.length - 1]?.revenue ?? 0
  const prevMonthRevenue = monthlyStats[monthlyStats.length - 2]?.revenue ?? 0
  const growth =
    prevMonthRevenue > 0
      ? Math.round(
          ((lastMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100,
        )
      : 0

  const bestSellerStats = useMemo(() => {
    const map = new Map<
      number,
      {
        productId: number
        name: string
        quantity: number
        revenue: number
        imageUrl?: string
      }
    >()

    orders.forEach((order) => {
      const date = getOrderDate(order)
      if (!date || date.getFullYear() !== safeSelectedYear) return

      order.orderItems?.forEach((item) => {
        const productId = item.productId
        const name =
          item.product?.name ?? item.variant?.title ?? `Sản phẩm #${productId}`
        const imageUrl =
          item.product?.productImages?.find((image) => image.isPrimary)?.url ??
          item.product?.productImages?.[0]?.url ??
          item.variant?.productImages?.find((image) => image.isPrimary)?.url ??
          item.variant?.productImages?.[0]?.url
        const existing = map.get(productId) ?? {
          productId,
          name,
          quantity: 0,
          revenue: 0,
          imageUrl,
        }

        map.set(productId, {
          productId,
          name,
          quantity: existing.quantity + Number(item.quantity ?? 0),
          revenue: existing.revenue + Number(item.totalPrice ?? 0),
          imageUrl: existing.imageUrl ?? imageUrl,
        })
      })
    })

    return Array.from(map.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
  }, [orders, safeSelectedYear])

  const productQueries = useQueries({
    queries: bestSellerStats.map((item) => ({
      queryKey: ['admin', 'products', 'detail', item.productId],
      queryFn: () => AdminProductService.getById(item.productId),
      enabled: !!item.productId,
    })),
  })

  const productImageMap = new Map<number, string>()
  productQueries.forEach((query, index) => {
    const product = query.data?.data
    const imageUrl =
      product?.productImages?.find((image) => image.isPrimary)?.url ??
      product?.productImages?.[0]?.url
    const productId = bestSellerStats[index]?.productId
    if (productId && imageUrl) {
      productImageMap.set(productId, imageUrl)
    }
  })

  const bestSellerDisplay = bestSellerStats.map((item) => ({
    ...item,
    imageUrl: item.imageUrl ?? productImageMap.get(item.productId),
  }))

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const dateA = getOrderDate(a)?.getTime() ?? 0
        const dateB = getOrderDate(b)?.getTime() ?? 0
        return dateB - dateA
      })
      .slice(0, 6)
  }, [orders])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Thống kê đơn hàng theo tháng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Năm</span>
          <Select
            value={String(safeSelectedYear)}
            onValueChange={(value) => setSelectedYear(Number(value))}
          >
            <SelectTrigger className="h-9 w-[120px]">
              <SelectValue placeholder="Chọn năm" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {ordersQuery.isError && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>Không thể tải dữ liệu</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Vui lòng thử lại sau hoặc kiểm tra kết nối API.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ordersQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`summary-skeleton-${index}`} className="h-28" />
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Tổng doanh thu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {formatCurrency(yearSummary.revenue, yearSummary.currency)}
                </div>
                <p className="text-muted-foreground text-xs">
                  Tổng doanh thu năm {safeSelectedYear}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Tổng đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {formatNumber(yearSummary.orders)}
                </div>
                <p className="text-muted-foreground text-xs">
                  Tính cả đơn chưa thanh toán
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Tỉ lệ thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-semibold">
                    {formatPercent(
                      yearSummary.orders
                        ? Math.round(
                            (yearSummary.paidOrders / yearSummary.orders) * 100,
                          )
                        : 0,
                    )}
                  </div>
                  <Badge variant="secondary">
                    {formatNumber(yearSummary.paidOrders)} đơn
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs">
                  Tỉ lệ đơn đã thanh toán
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Giá trị đơn TB
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {formatCurrency(
                    yearSummary.orders
                      ? yearSummary.revenue / yearSummary.orders
                      : 0,
                    yearSummary.currency,
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  Trung bình mỗi đơn
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Biểu đồ tăng trưởng</CardTitle>
              <p className="text-muted-foreground text-sm">
                Doanh thu theo tháng trong năm {safeSelectedYear}
              </p>
            </div>
            <Badge variant="outline">Doanh thu</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {ordersQuery.isLoading ? (
            <Skeleton className="h-56" />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="text-2xl font-semibold">
                    {formatCurrency(revenueTotal)}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <span>Tháng gần nhất</span>
                    <Badge variant={growth >= 0 ? 'secondary' : 'outline'}>
                      {growth >= 0 ? '+' : ''}
                      {formatPercent(growth)}
                    </Badge>
                  </div>
                </div>
                <div className="text-muted-foreground text-xs">
                  {monthLabels[0]} → {monthLabels[11]}
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2">
                {monthlyStats.map((item) => {
                  const height = Math.round((item.revenue / chartMax) * 100)
                  return (
                    <div
                      key={`bar-${item.month}`}
                      className="flex flex-col items-center gap-2"
                    >
                      <span className="text-muted-foreground text-[11px]">
                        {formatNumber(Math.round(item.revenue / 1000))}k
                      </span>
                      <div className="flex h-40 w-full items-end">
                        <div
                          className="w-full rounded-[14px] bg-foreground/90 transition-all"
                          style={{ height: `${Math.max(height, 8)}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground text-[11px]">
                        {item.month + 1}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-xs">
                <span>
                  Đỉnh:{' '}
                  {formatCurrency(
                    Math.max(...monthlyStats.map((item) => item.revenue)),
                  )}
                </span>
                <span>
                  Thấp:{' '}
                  {formatCurrency(
                    Math.min(...monthlyStats.map((item) => item.revenue)),
                  )}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sản phẩm bán chạy</CardTitle>
            <p className="text-muted-foreground text-sm">
              Top sản phẩm theo số lượng trong năm {safeSelectedYear}
            </p>
          </CardHeader>
          <CardContent>
            {ordersQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={`best-seller-${index}`} className="h-9" />
                ))}
              </div>
            ) : bestSellerDisplay.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                Chưa có dữ liệu sản phẩm trong năm này.
              </div>
            ) : (
              <div className="space-y-3">
                {bestSellerDisplay.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-xl border">
                        <AvatarImage
                          src={item.imageUrl}
                          alt={item.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-xs">
                          {item.name
                            .split(' ')
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {formatCurrency(item.revenue)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {formatNumber(item.quantity)} sp
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Đơn hàng gần đây</CardTitle>
              <p className="text-muted-foreground text-sm">
                Danh sách đơn hàng mới nhất
              </p>
            </div>
            <Badge variant="outline">{formatNumber(orders.length)} đơn</Badge>
          </CardHeader>
          <CardContent>
            {ordersQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={`recent-order-${index}`} className="h-10" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                Chưa có đơn hàng nào.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Ngày đặt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={`recent-${order.orderId}`}>
                      <TableCell className="font-medium">
                        #{order.orderId}
                      </TableCell>
                      <TableCell>
                        {order.shippingRecipientName ?? order.user?.name ?? '—'}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(
                          getOrderTotal(order),
                          order.currency ?? 'VND',
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getOrderStatusColor(order.status)}>
                          {getOrderStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatDate(order.placedAt ?? order.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
