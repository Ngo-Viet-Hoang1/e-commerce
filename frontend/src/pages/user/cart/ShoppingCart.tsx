import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CartItem as CartItemComponent, CartSummary } from '@/components/cart'
import {
  useClearCart,
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/hooks/useCart'
import { Loader2, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useState } from 'react'
import { useAuthStore } from '@/store/zustand/useAuthStore'

export default function ShoppingCart() {
  const navigate = useNavigate()
  const [showClearDialog, setShowClearDialog] = useState(false)
  const { isAuthenticated } = useAuthStore()

  const { data: cart, isLoading, error } = useCart()
  const updateCartItem = useUpdateCartItem()
  const removeCartItem = useRemoveCartItem()
  const clearCart = useClearCart()

  const handleUpdateQuantity = (
    productId: number,
    variantId: number,
    quantity: number,
  ) => {
    updateCartItem.mutate({ productId, variantId, input: { quantity } })
  }

  const handleRemoveItem = (productId: number, variantId: number) => {
    removeCartItem.mutate({ productId, variantId })
  }

  const handleClearCart = () => {
    clearCart.mutate()
    setShowClearDialog(false)
  }

  const handleCheckout = () => {
    navigate('/checkout')
  }

  if (!isAuthenticated) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag className="text-muted-foreground/50 mb-4 h-12 w-12" />
          <h3 className="text-lg font-medium">Giỏ hàng trống</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Vui lòng đăng nhập để xem giỏ hàng của bạn
          </p>
          <Button
            className="mt-4"
            onClick={() =>
              navigate('/auth/login', { state: { from: '/cart' } })
            }
          >
            Đăng nhập
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-destructive">{error.message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag className="text-muted-foreground/50 mb-4 h-12 w-12" />
          <h3 className="text-lg font-medium">Giỏ hàng trống</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Thêm sản phẩm để bắt đầu mua sắm
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => navigate('/products')}
          >
            Tiếp tục mua sắm
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          {cart.items.map((item) => (
            <CartItemComponent
              key={`${item.productId}-${item.variantId}-${item.quantity}-${item.currentPrice}`}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
              isUpdating={updateCartItem.isPending}
              isRemoving={removeCartItem.isPending}
            />
          ))}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96">
          <CartSummary
            summary={cart.summary}
            onCheckout={handleCheckout}
            onClearCart={() => setShowClearDialog(true)}
            isCheckoutDisabled={clearCart.isPending}
          />
        </div>
      </div>

      {/* Clear Cart Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa giỏ hàng?</AlertDialogTitle>
            <AlertDialogDescription>
              Tất cả sản phẩm sẽ bị xóa khỏi giỏ hàng. Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearCart}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa giỏ hàng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
