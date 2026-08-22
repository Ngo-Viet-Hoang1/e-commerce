import { useState } from 'react'
import {
  Coins,
  TrendingUp,
  ShoppingBag,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
} from 'lucide-react'
import { useDashboardStats } from '@/entities/dashboard'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import {
  getOrderStatusColor,
  getOrderStatusLabel,
} from '@/entities/order'
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
} from '@/shared/utils'

export default function AdminDashboard() {
  const [selectedYear, setSelectedYear] = useState<number>(() =>
    new Date().getFullYear(),
  )

  const { data: stats, isLoading, isError } = useDashboardStats(selectedYear)

  const yearOptions = stats?.yearOptions?.length
    ? stats.yearOptions
    : [new Date().getFullYear()]

  const summary = stats?.summary
  const monthlyStats = stats?.monthlyStats ?? []
  const bestSellers = stats?.bestSellers ?? []
  const categoryStats = stats?.categoryStats ?? []
  const statusDistribution = stats?.statusDistribution ?? []
  const recentOrders = stats?.recentOrders ?? []

  // Max value for monthly chart scaling
  const chartMax = Math.max(
    1,
    ...monthlyStats.map((item) => Math.max(item.revenue, item.cost)),
  )

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle2 className="size-3.5 text-emerald-600" />
      case 'shipping':
        return <Truck className="size-3.5 text-blue-600" />
      case 'cancelled':
        return <XCircle className="size-3.5 text-rose-600" />
      default:
        return <Clock className="size-3.5 text-amber-600" />
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-xl border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Tổng Quan Kinh Doanh
            <Badge variant="outline" className="text-xs font-normal border-primary/40 text-primary">
              Năm {selectedYear}
            </Badge>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Báo cáo doanh thu, lợi nhuận thực tế và hiệu quả vận hành tự động theo thời gian thực.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium">Chọn năm tài chính:</span>
          <Select
            value={String(selectedYear)}
            onValueChange={(val) => setSelectedYear(Number(val))}
          >
            <SelectTrigger className="h-8.5 w-[110px] text-xs font-semibold rounded-lg">
              <SelectValue placeholder="Chọn năm" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((yr) => (
                <SelectItem key={yr} value={String(yr)} className="text-xs">
                  Năm {yr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isError && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader className="py-3">
            <CardTitle className="text-sm text-destructive font-semibold">
              Không thể tải dữ liệu thống kê
            </CardTitle>
            <CardDescription className="text-xs">
              Vui lòng kiểm tra kết nối máy chủ backend hoặc thử lại sau.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* 4 Key KPI Metrics Cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Metric 1: Total Revenue */}
        <Card className="relative overflow-hidden border transition-all hover:shadow-sm">
          <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tổng Doanh Thu
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Coins className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {isLoading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(summary?.totalRevenue ?? 0, 'VND')}
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span
                    className={`inline-flex items-center font-medium px-1.5 py-0.5 rounded text-[11px] ${
                      (summary?.growthRate ?? 0) >= 0
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-rose-500/10 text-rose-600'
                    }`}
                  >
                    {(summary?.growthRate ?? 0) >= 0 ? (
                      <ArrowUpRight className="size-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="size-3 mr-0.5" />
                    )}
                    {formatPercent(summary?.growthRate ?? 0)}
                  </span>
                  <span className="text-muted-foreground text-[11px]">so với tháng trước</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Metric 2: Net Profit (Lợi Nhuận Thực Tế) */}
        <Card className="relative overflow-hidden border transition-all hover:shadow-sm bg-gradient-to-br from-card via-card to-emerald-500/5">
          <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              Lợi Nhuận Thực Tế
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {isLoading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(summary?.netProfit ?? 0, 'VND')}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5">
                  <span>
                    Tỷ suất lãi:{' '}
                    <strong className="text-emerald-700 font-semibold">
                      {summary?.profitMargin ?? 0}%
                    </strong>
                  </span>
                  <span>
                    Vốn:{' '}
                    <span className="font-mono text-[11px]">
                      {formatCurrency(summary?.totalCost ?? 0, 'VND')}
                    </span>
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Metric 3: Total Orders & Paid Rate */}
        <Card className="relative overflow-hidden border transition-all hover:shadow-sm">
          <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tổng Đơn Hàng
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <ShoppingBag className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {isLoading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {formatNumber(summary?.totalOrders ?? 0)} <span className="text-xs font-normal text-muted-foreground">đơn</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground text-[11px]">
                    Thanh toán:{' '}
                    <strong className="text-foreground font-semibold">
                      {summary?.paidRate ?? 0}%
                    </strong>{' '}
                    ({summary?.paidOrders ?? 0} đơn)
                  </span>
                  <Badge variant="outline" className="text-[10px] h-4 px-1 text-rose-500 border-rose-200">
                    Hủy: {summary?.cancelledOrders ?? 0}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Metric 4: Average Order Value (AOV) */}
        <Card className="relative overflow-hidden border transition-all hover:shadow-sm">
          <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Giá Trị Đơn Trung Bình
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Receipt className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {isLoading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(summary?.avgOrderValue ?? 0, 'VND')}
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Doanh thu bình quân trên mỗi lượt mua hàng
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue vs Profit Chart */}
      <Card className="border">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                Biểu Đồ Doanh Thu & Lợi Nhuận 12 Tháng
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                So sánh Doanh thu (Đen) và Lợi nhuận thực tế (Xanh lá) của từng tháng trong năm {selectedYear}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-xs bg-foreground" />
                <span className="text-muted-foreground">Doanh thu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-xs bg-emerald-500" />
                <span className="text-emerald-600 font-medium">Lợi nhuận</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-1.5 sm:gap-2 pt-4">
                {monthlyStats.map((item) => {
                  const revHeight = Math.round((item.revenue / chartMax) * 100)
                  const profitHeight = Math.round((item.profit / chartMax) * 100)

                  return (
                    <div
                      key={`bar-${item.month}`}
                      className="group relative flex flex-col items-center gap-1.5"
                    >
                      {/* Floating tooltip on hover */}
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-20 bg-popover text-popover-foreground border shadow-lg px-2.5 py-1.5 rounded-lg text-[11px] whitespace-nowrap pointer-events-none">
                        <span className="font-bold">{item.monthLabel}</span>
                        <span>Doanh thu: {formatCurrency(item.revenue, 'VND')}</span>
                        <span className="text-emerald-600 font-semibold">
                          Lãi: {formatCurrency(item.profit, 'VND')} ({item.profitMargin}%)
                        </span>
                      </div>

                      {/* Dual Bar (Revenue + Profit) */}
                      <div className="flex h-44 w-full items-end justify-center gap-1 bg-muted/20 rounded-lg p-1">
                        {/* Revenue Bar */}
                        <div
                          className="w-1/2 rounded-t-md bg-foreground/90 transition-all group-hover:bg-foreground"
                          style={{ height: `${Math.max(revHeight, 4)}%` }}
                        />
                        {/* Profit Bar */}
                        <div
                          className="w-1/2 rounded-t-md bg-emerald-500/80 transition-all group-hover:bg-emerald-500"
                          style={{ height: `${Math.max(profitHeight, 4)}%` }}
                        />
                      </div>

                      {/* Month Label */}
                      <span className="text-muted-foreground text-[11px] font-medium">
                        T{item.month}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Chart Footnote */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>
                    Tổng doanh thu năm:{' '}
                    <strong className="text-foreground font-semibold">
                      {formatCurrency(summary?.totalRevenue ?? 0, 'VND')}
                    </strong>
                  </span>
                  <span>
                    Tổng lãi thực tế:{' '}
                    <strong className="text-emerald-600 font-semibold">
                      {formatCurrency(summary?.netProfit ?? 0, 'VND')}
                    </strong>
                  </span>
                </div>
                <div className="italic text-[11px]">
                  * Dữ liệu được tính toán trực tiếp từ cơ sở dữ liệu sau khi khấu trừ chi phí vốn.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Middle Grid: Top Products & Category/Status Breakdown */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left 6 cols: Category Share & Order Status Distribution */}
        <div className="lg:col-span-6 space-y-5">
          {/* Category Contribution */}
          <Card className="border">
            <CardHeader className="pb-2.5">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                Đóng Góp Doanh Thu Theo Danh Mục
              </CardTitle>
              <CardDescription className="text-xs">
                Tỷ trọng doanh thu theo từng nhóm ngành hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : categoryStats.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-3">Chưa có dữ liệu danh mục</p>
              ) : (
                <div className="space-y-3">
                  {categoryStats.map((cat) => (
                    <div key={cat.categoryId} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{cat.categoryName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{formatCurrency(cat.revenue, 'VND')}</span>
                          <Badge variant="secondary" className="text-[10px] h-4.5 px-1.5 font-semibold">
                            {cat.percentage}%
                          </Badge>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <Card className="border">
            <CardHeader className="pb-2.5">
              <CardTitle className="text-base font-bold">Phân Bổ Trạng Thái Đơn Hàng</CardTitle>
              <CardDescription className="text-xs">
                Tỷ lệ xử lý các đơn hàng trong năm {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {statusDistribution.map((st) => (
                    <div
                      key={st.status}
                      className="flex flex-col p-2.5 rounded-lg border bg-muted/20 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        {getStatusIcon(st.status)}
                        <span className="text-[11px] font-bold text-foreground">
                          {st.percentage}%
                        </span>
                      </div>
                      <div className="text-xs font-semibold truncate capitalize">
                        {getOrderStatusLabel(st.status)}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {formatNumber(st.count)} đơn
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 6 cols: Top 5 Best Sellers */}
        <div className="lg:col-span-6">
          <Card className="border h-full flex flex-col justify-between">
            <CardHeader className="pb-2.5">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>Top Sản Phẩm Bán Chạy & Sinh Lời</span>
                <Badge variant="outline" className="text-[11px] font-normal">Top 5</Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Sản phẩm đóng góp doanh số và lợi nhuận cao nhất
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : bestSellers.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-4">Chưa có sản phẩm bán chạy trong năm này.</p>
              ) : (
                <div className="space-y-2.5">
                  {bestSellers.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-2 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-bold text-xs text-muted-foreground w-4 text-center">
                          #{idx + 1}
                        </span>
                        <Avatar className="size-9 rounded-md border shrink-0">
                          <AvatarImage src={item.imageUrl} alt={item.name} className="object-cover" />
                          <AvatarFallback className="text-[10px] uppercase font-bold">
                            {item.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-xs font-semibold text-foreground truncate max-w-[180px] sm:max-w-[240px]">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {item.sku}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-0.5">
                        <div className="text-xs font-bold text-foreground">
                          {formatCurrency(item.revenue, 'VND')}
                        </div>
                        <div className="flex items-center justify-end gap-1.5 text-[11px]">
                          <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                            {item.quantity} sp
                          </Badge>
                          <span className="text-emerald-600 font-semibold text-[10px]">
                            +{formatCurrency(item.profit, 'VND')} lãi
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Table: 6 Recent Orders */}
      <Card className="border">
        <CardHeader className="flex flex-row items-center justify-between pb-2.5">
          <div>
            <CardTitle className="text-base font-bold">Đơn Hàng Gần Đây</CardTitle>
            <CardDescription className="text-xs">
              Các giao dịch mới nhất được ghi nhận trên hệ thống
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {recentOrders.length} đơn gần nhất
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : recentOrders.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-3">Chưa có đơn hàng nào.</p>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="text-xs font-semibold h-9">Mã Đơn</TableHead>
                    <TableHead className="text-xs font-semibold h-9">Khách Hàng</TableHead>
                    <TableHead className="text-xs font-semibold h-9">Số Món</TableHead>
                    <TableHead className="text-xs font-semibold h-9">Tổng Tiền</TableHead>
                    <TableHead className="text-xs font-semibold h-9">Trạng Thái</TableHead>
                    <TableHead className="text-xs font-semibold h-9 text-right">Ngày Đặt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.orderId} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        #{order.orderId}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="font-medium text-foreground">{order.customerName}</div>
                        {order.customerEmail && (
                          <div className="text-[11px] text-muted-foreground">{order.customerEmail}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-medium">
                        {order.itemCount} sản phẩm
                      </TableCell>
                      <TableCell className="text-xs font-semibold">
                        {formatCurrency(order.totalAmount, order.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getOrderStatusColor(order.status)} text-[11px] font-medium`}>
                          {getOrderStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
