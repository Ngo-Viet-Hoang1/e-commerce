import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  CreditCard,
  Minus,
  MoveRight,
  Package,
  Plus,
  Shield,
  ShoppingBag,
  Store,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface CartItem {
  id: string
  name: string
  color: string
  size: string
  price: number
  originalPrice: number
  quantity: number
  image: string
  estimatedDelivery: string
}

interface CartData {
  items: CartItem[]
  shipping: {
    freeThreshold: number
    message: string
  }
}

const cartData: CartData = {
  items: [
    {
      id: '1',
      name: 'Premium Wool Cardigan',
      color: 'Sage Green',
      size: 'M',
      price: 129.99,
      originalPrice: 159.99,
      quantity: 1,
      image:
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800',
      estimatedDelivery: '2-4 business days',
    },
    {
      id: '2',
      name: 'Designer Leather Bag',
      color: 'Vintage Brown',
      size: 'One Size',
      price: 299.99,
      originalPrice: 349.99,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
      estimatedDelivery: '3-5 business days',
    },
    {
      id: '3',
      name: 'Smart Watch Pro',
      color: 'Space Grey',
      size: 'One Size',
      price: 199.99,
      originalPrice: 249.99,
      quantity: 1,
      image:
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop',
      estimatedDelivery: '1-3 business days',
    },
  ],
  shipping: {
    freeThreshold: 500,
    message: 'Free shipping on orders over $500',
  },
}

export default function ShoppingCart() {
  const navigate = useNavigate()
  const [items, setItems] = useState<CartItem[]>(cartData.items)
  const [isRemoving, setIsRemoving] = useState<string | null>(null)

  const updateQuantity = (id: string, increment: boolean) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + (increment ? 1 : -1)),
            }
          : item,
      ),
    )
  }

  const removeItem = (id: string) => {
    setIsRemoving(id)
    setTimeout(() => {
      setItems((currentItems) => currentItems.filter((item) => item.id !== id))
      setIsRemoving(null)
    }, 300)
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  const savings = items.reduce(
    (sum, item) => sum + (item.originalPrice - item.price) * item.quantity,
    0,
  )
  const shipping = subtotal >= cartData.shipping.freeThreshold ? 0 : 15.99
  const total = subtotal + shipping

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your Shopping Cart
        </h1>
        <p className="text-muted-foreground">
          {items.length} {items.length === 1 ? 'item' : 'items'} in your cart •{' '}
          <span className="text-foreground font-semibold">
            ${subtotal.toFixed(2)}
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-6">
          {/* Cart Items */}
          {items.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="text-muted-foreground/50 mb-4 size-12" />
                <h3 className="text-lg font-medium">Your cart is empty</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Add some items to get started
                </p>
                <Button className="mt-4 cursor-pointer" variant="outline">
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            items.map((item) => (
              <Card
                key={item.id}
                className={cn('gap-0 overflow-hidden py-0', {
                  'opacity-50': isRemoving === item.id,
                })}
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-auto w-full sm:w-40">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-36 w-full object-cover object-center"
                    />
                  </div>

                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-foreground text-lg font-medium">
                          {item.name}
                        </h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {item.color} {item.size && `• ${item.size}`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-8 cursor-pointer"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8 cursor-pointer"
                          onClick={() => updateQuantity(item.id, false)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8 cursor-pointer"
                          onClick={() => updateQuantity(item.id, true)}
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>

                      <div className="text-end">
                        <p className="text-lg font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        {item.originalPrice > item.price && (
                          <p className="text-muted-foreground text-xs line-through">
                            ${item.originalPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <CardFooter className="bg-muted/20 border-t px-4 py-2!">
                  <div className="text-muted-foreground flex items-center text-sm">
                    <Package className="me-2 size-4" />
                    <span>Estimated delivery: {item.estimatedDelivery}</span>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* Order Summary */}
        <div className="w-full space-y-4 lg:w-96">
          <Card className="sticky top-4 gap-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-sm font-medium">
                    <span>You Save</span>
                    <span>-${savings.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <Separator className="my-2" />

              <div className="flex items-center justify-between text-base font-medium">
                <span>Total</span>
                <div className="text-end">
                  <p className="text-xl font-bold">${total.toFixed(2)}</p>
                  <p className="text-muted-foreground text-xs">
                    including VAT, if applicable
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                className="mt-4 w-full cursor-pointer text-base font-medium"
                disabled={items.length === 0}
                onClick={() => navigate('/checkout')}
              >
                <ShoppingBag className="me-2 size-5" />
                Proceed to Checkout
              </Button>

              <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
                <CreditCard className="size-3.5" />
                <span>Secure payment with SSL encryption</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed py-4">
            <CardContent className="px-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <Shield className="size-5" />
                </div>
                <div>
                  <h4 className="font-medium">Secure Checkout</h4>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Your payment information is encrypted and secure.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full cursor-pointer">
            <Store className="me-2 size-4" />
            Continue Shopping
            <MoveRight className="ms-2 size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
