import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRemoveCartItems } from '@/hooks/useCart'
import { useUserOrderById } from '@/hooks/useOrder'
import { useAuthStore } from '@/store/zustand/useAuthStore'
import { CheckCircle2, LoaderCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { isAuthenticated } = useAuthStore()
  const removeCartItems = useRemoveCartItems()

  const orderId = useMemo(() => {
    const raw = params.get('orderId')
    if (!raw) return 0
    const parsed = Number(raw)
    return Number.isNaN(parsed) ? 0 : parsed
  }, [params])

  const { data: order, isLoading } = useUserOrderById(orderId, {
    refetchInterval: 3000,
  })

  const [didCleanup, setDidCleanup] = useState(false)

  useEffect(() => {
    if (!order || didCleanup) return
    if (order.paymentStatus !== 'paid') return

    const items = (order.orderItems ?? []).map((item) => ({
      productId: item.productId,
      variantId: item.variantId ?? 0,
    }))

    const validItems = items.filter((item) => item.variantId > 0)

    removeCartItems
      .mutateAsync(validItems)
      .catch(() => {
        // Keep checkout flow resilient even if cart cleanup fails.
      })
      .finally(() => {
        setDidCleanup(true)
        navigate(`/checkout/complete/${order.orderId}`, { replace: true })
      })
  }, [didCleanup, navigate, order, removeCartItems])

  if (!isAuthenticated) {
    return (
      <Card className="mx-auto mt-10 max-w-xl">
        <CardHeader>
          <CardTitle>Thanh toán thành công</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Thanh toán đã được ghi nhận. Vui lòng đăng nhập để xem chi tiết đơn
            hàng.
          </p>
          <Button onClick={() => navigate('/auth/login')}>Đăng nhập</Button>
        </CardContent>
      </Card>
    )
  }

  if (!orderId) {
    return (
      <Card className="mx-auto mt-10 max-w-xl">
        <CardHeader>
          <CardTitle>Không tìm thấy mã đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/profile/orders')}>
            Xem đơn hàng của tôi
          </Button>
        </CardContent>
      </Card>
    )
  }

  const waiting = isLoading || order?.paymentStatus !== 'paid'

  return (
    <Card className="mx-auto mt-10 max-w-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="text-emerald-600" />
          Thanh toán thành công
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {waiting ? (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <LoaderCircle className="size-4 animate-spin" />
            Đang xác nhận trạng thái đơn hàng...
          </div>
        ) : (
          <p className="text-sm">Đang chuyển đến trang hoàn tất đơn hàng...</p>
        )}

        <Button variant="outline" onClick={() => navigate('/profile/orders')}>
          Về danh sách đơn hàng
        </Button>
      </CardContent>
    </Card>
  )
}
