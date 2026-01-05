import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'

interface CartButtonProps {
  variant?: 'default' | 'ghost' | 'outline'
  showLabel?: boolean
  className?: string
}

export function CartButton({
  variant = 'ghost',
  showLabel = false,
  className,
}: CartButtonProps) {
  const { data: cart } = useCart()

  const itemCount = cart?.summary?.itemCount ?? 0

  return (
    <Link to="/cart">
      <Button
        variant={variant}
        size={showLabel ? 'default' : 'icon'}
        className={className}
      >
        <div className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="bg-destructive text-destructive-foreground absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold">
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
        </div>
        {showLabel && <span className="ml-2">Giỏ hàng</span>}
      </Button>
    </Link>
  )
}
