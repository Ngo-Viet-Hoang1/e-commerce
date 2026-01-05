import { Button } from '@/components/ui/button'
import { useAddToCart } from '@/hooks/useCart'
import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'

interface AddToCartButtonProps {
  productId: number
  variantId: number
  quantity?: number
  children?: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function AddToCartButton({
  productId,
  variantId,
  quantity = 1,
  children,
  variant = 'default',
  size = 'default',
  className,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const addToCart = useAddToCart()

  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      await addToCart.mutateAsync({
        productId,
        variantId,
        quantity,
      })
    } catch {
      // Error handled by useAddToCart hook
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleAddToCart}
      disabled={isAdding || addToCart.isPending}
    >
      {isAdding || addToCart.isPending ? (
        <>Đang thêm...</>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {children ?? 'Thêm vào giỏ'}
        </>
      )}
    </Button>
  )
}
