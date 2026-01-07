import ImageViewer from '@/components/commerce-ui/image-viewer-basic'
import { Button } from '@/components/ui/button'
import { DEFAULT_IMAGE_URL } from '@/constants'
import { CreditCard, Heart, ShoppingCart, Truck } from 'lucide-react'
import ProductPrice from './ProductPrice'
import { Link } from 'react-router-dom'

interface ProductCardProps {
  imageUrl: string
  tagText?: string
  productName: string
  sku: string
  minPrice: number
  maxPrice?: number
  minSalePrice?: number
  rating?: number
  maxRating?: number
  reviewCount?: number
  isWishlisted?: boolean
  onToggleWishlist?: () => void
  onAddToCart?: () => void
  onBuyNow?: () => void
}

function ProductCard({
  productName,
  sku,
  imageUrl = DEFAULT_IMAGE_URL,
  minPrice,
  maxPrice,
  minSalePrice,
  tagText,
  maxRating = 5,
  rating = 4.5,
  reviewCount = 128,
  isWishlisted = false,
  onToggleWishlist = () => {
    //empty
  },
  onAddToCart = () => {
    //empty
  },
  onBuyNow = () => {
    //empty
  },
}: ProductCardProps) {
  return (
    <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
      {/* Gradient badge  */}
      {tagText && (
        <div className="absolute top-3 left-3 z-10">
          <span className="relative inline-block rounded-full bg-linear-to-r from-indigo-500 to-indigo-700 px-3 py-1.5 text-xs font-semibold text-white">
            {tagText}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-500"></span>
            </span>
          </span>
        </div>
      )}

      {/* Wishlist icon */}
      <Button
        variant="ghost"
        aria-label={
          isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'
        }
        onClick={(e) => {
          e.stopPropagation()
          onToggleWishlist()
        }}
        className={`absolute top-3 right-3 z-20 scale-90 cursor-pointer rounded-full opacity-0 shadow backdrop-blur transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 hover:text-red-500 ${isWishlisted ? 'text-red-500' : 'text-gray-500'}`}
      >
        <Heart
          fill={isWishlisted ? 'currentColor' : 'none'}
          color="currentColor"
          size={18}
        />
      </Button>

      {/* Image container with background glow effect */}
      <div className="relative overflow-hidden rounded-lg bg-linear-to-br from-indigo-50 to-purple-50 p-6 dark:from-indigo-950/30 dark:to-purple-950/30">
        <div className="absolute -bottom-10 left-1/2 h-40 w-40 -translate-x-1/2 transform rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="transition-transform duration-500 group-hover:scale-105">
          <ImageViewer
            imageUrl={imageUrl}
            classNameThumbnailViewer="rounded-lg object-contain h-[180px] mx-auto"
          />
        </div>

        {/* Action buttons - appear at bottom of image on hover */}
        <div className="absolute right-0 bottom-0 left-0 flex translate-y-full gap-2 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart()
            }}
            className="flex-1 cursor-pointer bg-white/95 shadow-lg backdrop-blur-sm hover:bg-white dark:bg-gray-800/95 dark:hover:bg-gray-800"
          >
            <ShoppingCart size={16} />
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onBuyNow()
            }}
            className="flex-1 cursor-pointer bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:from-indigo-700 hover:to-purple-700"
          >
            <CreditCard size={16} />
          </Button>
        </div>
      </div>

      {/* Product details */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-gray-900 hover:underline dark:text-gray-100">
            <Link to={`/product-detail/${sku}`}>{productName}</Link>
          </h3>
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

        {/* Price */}
        <div className="mt-auto">
          <ProductPrice
            minPrice={minPrice}
            maxPrice={maxPrice}
            minSalePrice={minSalePrice}
          />
          <p className="mt-2 inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
            <Truck size={16} />
            Free delivery
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
export type { ProductCardProps }
