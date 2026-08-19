import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function PaymentFailed() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const orderId = params.get('orderId')
  const code = params.get('code')
  const reason = params.get('reason')

  const message = useMemo(() => {
    if (reason === 'invalid_signature') {
      return 'Không thể xác thực phản hồi thanh toán. Vui lòng thử lại.'
    }

    if (code) {
      return `Thanh toán thất bại với mã phản hồi: ${code}.`
    }

    return 'Thanh toán chưa thành công. Bạn có thể thử lại.'
  }, [code, reason])

  return (
    <Card className="mx-auto mt-10 max-w-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <XCircle className="text-red-600" />
          Thanh toán thất bại
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">{message}</p>
        {orderId && (
          <p className="text-xs">
            Mã đơn hàng: <span className="font-medium">#{orderId}</span>
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate('/checkout')}>
            Thử thanh toán lại
          </Button>
          <Button variant="outline" onClick={() => navigate('/profile/orders')}>
            Xem đơn hàng của tôi
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
