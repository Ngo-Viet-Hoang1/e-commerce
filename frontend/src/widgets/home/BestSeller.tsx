import { ProductService, type Product } from '@/entities/product'
import ProductCard from '@/entities/product'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shared/ui/carousel'
import { Skeleton } from '@/shared/ui/skeleton'
import { DEFAULT_IMAGE_URL } from '@/shared/constants'
import {
  useAddFavorite,
  useFavoriteProducts,
  useRemoveFavorite,
} from '@/features/wishlist'
import { useAuthStore } from '@/features/auth'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const BEST_SELLER_LIMIT = 8

const BestSeller = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  
  const { data: bestSellerData, isLoading: isBestSellerLoading } = useQuery({
    queryKey: ['best-sellers', BEST_SELLER_LIMIT],
    queryFn: () => ProductService.getBestSellers(BEST_SELLER_LIMIT),
  })

  // Fallback to featured products if best sellers is empty
  const { data: featuredData, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featured-products-fallback', BEST_SELLER_LIMIT],
    queryFn: () => ProductService.getFeatured(BEST_SELLER_LIMIT),
    enabled: !isBestSellerLoading && (!bestSellerData?.data || bestSellerData.data.length === 0),
  })

  const rawProducts = useMemo(() => {
    if (bestSellerData?.data && bestSellerData.data.length > 0) {
      return bestSellerData.data
    }
    return featuredData?.data ?? []
  }, [bestSellerData, featuredData])

  const isLoading = isBestSellerLoading || (isFeaturedLoading && rawProducts.length === 0)

  const { data: favoritesData } = useFavoriteProducts()
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()
  const [pendingFavoriteId, setPendingFavoriteId] = useState<number | null>(null)
  
  const favoriteIds = useMemo(() => {
    return new Set((favoritesData?.data ?? []).map((product: Product) => product.id))
  }, [favoritesData?.data])

  const handleToggleFavorite = (productId: number, isFavorite: boolean) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào yêu thích')
      navigate('/auth/login', { state: { from: window.location.pathname } })
      return
    }
    if (pendingFavoriteId === productId) return
    setPendingFavoriteId(productId)
    const mutation = isFavorite ? removeFavorite : addFavorite
    mutation.mutate(productId, {
      onSettled: () => setPendingFavoriteId(null),
    })
  }

  const displayItems = useMemo(() => {
    return rawProducts.map((item) => {
      const variantImages = item.variants?.flatMap(
        (variant) => variant.productImages ?? [],
      )
      const productImage =
        item.productImages?.find((img) => img.isPrimary)?.url ??
        item.productImages?.[0]?.url ??
        variantImages?.[0]?.url

      const variantPrices = item.variants?.map((variant) => variant.price) ?? []
      const fallbackMinPrice =
        variantPrices.length > 0 ? Math.min(...variantPrices) : 0
      const fallbackMaxPrice =
        variantPrices.length > 0 ? Math.max(...variantPrices) : undefined
      const minPrice = item.minPrice ?? fallbackMinPrice
      const maxPrice =
        fallbackMaxPrice !== undefined && fallbackMaxPrice > minPrice
          ? fallbackMaxPrice
          : undefined

      const imageUrl = productImage ?? DEFAULT_IMAGE_URL

      return {
        productId: item.id,
        productName: item.name,
        sku: item.sku,
        minPrice,
        maxPrice,
        imageUrl,
      }
    })
  }, [rawProducts])

  if (!isLoading && displayItems.length === 0) {
    return null
  }

  return (
    <section className="space-y-8 py-12">
      <header className="space-y-2 text-center">
        <h2 className="text-3xl font-bold text-balance sm:text-4xl">
          Bán chạy nhất
        </h2>
        <p className="text-muted-foreground mx-auto max-w-[160ch] text-balance">
          Những sản phẩm nổi bật được nhiều khách hàng quan tâm và đánh giá tốt.
        </p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <Carousel>
          <CarouselContent>
            {displayItems.map((item) => {
              const isFavorite = favoriteIds.has(item.productId)
              return (
                <CarouselItem
                  key={item.productId}
                  className="basis-full pl-2 sm:basis-1/2 md:pl-4 lg:basis-1/3 xl:basis-1/4"
                >
                  <ProductCard
                    key={item.productId}
                    imageUrl={item.imageUrl}
                    productName={item.productName}
                    sku={item.sku}
                    minPrice={item.minPrice}
                    maxPrice={item.maxPrice}
                    tagText="Bán chạy"
                    isWishlisted={isFavorite}
                    onToggleWishlist={() =>
                      handleToggleFavorite(item.productId, isFavorite)
                    }
                  />
                </CarouselItem>
              )
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden lg:flex" />
          <CarouselNext className="hidden lg:flex" />
        </Carousel>
      )}
    </section>
  )
}

export default BestSeller
