import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import type {
  Attribute,
  Product,
  ProductVariant,
  SelectedAttributes,
} from '@/interfaces/product.interface'
import { formatCurrency } from '@/lib/format'
import {
  Check,
  CreditCard,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
} from 'lucide-react'
import { useState } from 'react'

interface ProductInfoProps {
  product: Product
  attributes: Attribute[]
  selectedAttrs: SelectedAttributes
  setSelectedAttrs: React.Dispatch<React.SetStateAction<SelectedAttributes>>
  selectedVariant: ProductVariant | undefined
  isOptionDisabled: (attributeName: string, value: string) => boolean
  onAddToCart?: (variant: ProductVariant, quantity: number) => void
  onBuyNow?: (variant: ProductVariant, quantity: number) => void
}

export function ProductInfo({
  product,
  attributes,
  selectedAttrs,
  setSelectedAttrs,
  selectedVariant,
  isOptionDisabled,
  onAddToCart,
  onBuyNow,
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  const maxStock = selectedVariant?.stockQuantity ?? 0
  const isOutOfStock = maxStock === 0
  const hasDiscount = !!(
    selectedVariant?.msrp && selectedVariant.msrp > selectedVariant.price
  )

  const discountPercentage =
    selectedVariant?.msrp && selectedVariant.msrp > selectedVariant.price
      ? Math.round(
          ((selectedVariant.msrp - selectedVariant.price) /
            selectedVariant.msrp) *
            100,
        )
      : undefined

  const handleQuantityChange = (delta: number): void => {
    setQuantity((prev) => Math.max(1, Math.min(maxStock, prev + delta)))
  }

  const handleQuantityInput = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const value = parseInt(e.target.value) || 1
    setQuantity(Math.max(1, Math.min(maxStock, value)))
  }

  const handleAddToCart = (): void => {
    if (!selectedVariant || isOutOfStock) return

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)

    onAddToCart?.(selectedVariant, quantity)
  }

  const handleBuyNow = (): void => {
    if (!selectedVariant || isOutOfStock) return
    onBuyNow?.(selectedVariant, quantity)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {product.name} {product.isFeatured && '⭐'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Thương hiệu:{' '}
              <span className="text-foreground font-medium">
                {product.brand?.name}
              </span>
            </p>
            <p className="text-muted-foreground text-sm">
              SKU: {selectedVariant?.sku ?? product.sku}
            </p>
          </div>

          <Button
            className="cursor-pointer"
            variant="outline"
            size="icon"
            title="Thêm vào yêu thích"
          >
            <Heart color="red" className="h-4 w-4" />
          </Button>
        </div>

        {/* Reviews */}
        {/* <div className="mb-2 flex items-center">
          <StarRating_Fractions
            value={rating}
            maxStars={maxRating}
            readOnly
            iconSize={16}
            color="#f59e0b"
          />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {rating} ({reviewCount} reviews)
          </span>
        </div> */}
      </div>

      <Separator />

      {/* Price */}
      <div>
        <div className="flex items-baseline gap-3">
          <span className="text-primary text-3xl font-bold">
            {selectedVariant ? formatCurrency(selectedVariant.price) : '--'}
          </span>
          {hasDiscount && selectedVariant?.msrp && (
            <>
              <span className="text-muted-foreground text-xl line-through">
                {formatCurrency(selectedVariant.msrp)}
              </span>

              <span className="ml-3 shrink-0 rounded-sm border border-emerald-500 bg-emerald-100 px-2 py-1 text-sm font-medium text-emerald-600">
                -{discountPercentage}%
              </span>
            </>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2">
          {isOutOfStock ? (
            <Badge variant="destructive">Hết hàng</Badge>
          ) : maxStock < 10 ? (
            <Badge variant="secondary">Chỉ còn {maxStock} sản phẩm</Badge>
          ) : (
            <Badge variant="secondary">Còn hàng</Badge>
          )}
        </div>
      </div>

      {/* Attributes Selection */}
      {attributes.map((attr) => (
        <div key={attr.name} className="space-y-3">
          <h3 className="font-semibold">{attr.name}</h3>
          <RadioGroup
            value={selectedAttrs[attr.name]}
            onValueChange={(value: string) =>
              setSelectedAttrs((prev) => {
                const next = { ...prev, [attr.name]: value }

                for (const key of Object.keys(next)) {
                  if (isOptionDisabled(key, next[key])) {
                    delete next[key]
                  }
                }

                return next
              })
            }
            className="flex flex-wrap gap-2"
          >
            {attr.values.map((value) => {
              const disabled = isOptionDisabled(attr.name, value)
              const selected = selectedAttrs[attr.name] === value
              return (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border-2 px-4 py-2 transition-colors ${
                    selected ? 'border-primary bg-primary/5' : 'border-border'
                  } ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-primary/50'}`}
                >
                  <RadioGroupItem
                    value={value}
                    disabled={disabled}
                    className="sr-only"
                  />
                  <span className="font-medium">{value}</span>
                  {selected && <Check className="text-primary h-4 w-4" />}
                </label>
              )
            })}
          </RadioGroup>
        </div>
      ))}

      {/* Quantity Selector */}
      <div className="space-y-3">
        <h3 className="font-semibold">Số lượng</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityInput}
              className="w-16 [appearance:textfield] border-none text-center outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              min="1"
              max={maxStock}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= maxStock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-muted-foreground text-sm">
            {maxStock} sản phẩm có sẵn
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          size="lg"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={!selectedVariant || isOutOfStock}
        >
          {addedToCart ? (
            <>
              <Check className="mr-2 h-5 w-5" />
              Đã thêm vào giỏ
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Thêm vào giỏ hàng
            </>
          )}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={handleBuyNow}
          disabled={!selectedVariant || isOutOfStock}
        >
          <CreditCard />
          Mua ngay
        </Button>
      </div>

      {/* Short Description */}
      {product.shortDescription && (
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm">{product.shortDescription}</p>
        </div>
      )}
    </div>
  )
}
