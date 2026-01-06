import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/format'
import { useFeaturedProducts } from '@/pages/admin/ProductManagement/product.queries'
import { ArrowRight, Flame, ShoppingCart, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const storeData = {
  title: 'Công nghệ hàng đầu, giá tốt nhất',
  subtitle:
    'Khám phá các sản phẩm điện thoại, laptop và thiết bị công nghệ cao cấp. Chính hãng, bảo hành đầy đủ, giao hàng toàn quốc.',
}

export default function StorefrontHero() {
  const navigate = useNavigate()
  const { data: featuredData, isLoading } = useFeaturedProducts()
  const [api, setApi] = useState<{
    selectedScrollSnap: () => number
    scrollTo: (index: number) => void
  }>()
  const [currentSlide, setCurrentSlide] = useState(0)

  const featuredProducts = featuredData?.data ?? []

  // Auto-scroll functionality
  useEffect(() => {
    if (!api || featuredProducts.length === 0) return

    const interval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % featuredProducts.length
      api.scrollTo(nextSlide)
      setCurrentSlide(nextSlide)
    }, 5000)

    return () => clearInterval(interval)
  }, [api, currentSlide, featuredProducts.length])

  return (
    <section className="relative py-6">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <header className="space-y-8">
          <Badge variant="outline" className="rounded-full px-4 py-2">
            <TrendingUp className="me-1 size-4!" />
            Sản phẩm mới 2025
          </Badge>

          <h1 className="text-5xl leading-tight font-bold text-balance md:text-6xl lg:text-7xl">
            {storeData.title}
          </h1>

          <p className="text-muted-foreground max-w-lg text-xl text-balance">
            {storeData.subtitle}
          </p>

          <div className="flex gap-4">
            <Button
              size="lg"
              variant="outline"
              className="cursor-pointer gap-2 rounded-full bg-emerald-500 px-8 text-white"
              onClick={() => navigate('/product-catalog')}
            >
              <ShoppingCart className="size-4" />
              Mua sắm ngay
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </header>

        <div className="flex flex-col gap-4">
          {isLoading ? (
            <Skeleton className="h-[500px] w-full rounded-md" />
          ) : featuredProducts.length === 0 ? (
            <Card className="flex h-[500px] items-center justify-center">
              <CardContent>
                <p className="text-muted-foreground">
                  Chưa có sản phẩm nổi bật
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="relative h-[500px] w-full border-0">
              <Carousel
                className="group size-full"
                setApi={setApi}
                opts={{
                  align: 'start',
                  loop: true,
                  duration: 20,
                  skipSnaps: true,
                }}
                onSelect={() => {
                  if (api) {
                    setCurrentSlide(api.selectedScrollSnap())
                  }
                }}
              >
                <CarouselContent className="h-full">
                  {featuredProducts.map((product) => {
                    const defaultVariant =
                      product.variants?.find((v) => v.isDefault) ??
                      product.variants?.[0]
                    const primaryImage =
                      product.productImages?.find((img) => img.isPrimary) ??
                      product.productImages?.[0]

                    // Calculate min/max prices from variants (API returns string prices)
                    const variantPrices =
                      product.variants?.map((v) => Number(v.price)) ?? []
                    const minPrice =
                      variantPrices.length > 0 ? Math.min(...variantPrices) : 0
                    const maxPrice =
                      variantPrices.length > 0 ? Math.max(...variantPrices) : 0

                    // Check if we should show price range
                    const hasMultiplePrices =
                      product.variants &&
                      product.variants.length > 1 &&
                      minPrice !== maxPrice

                    const displayPrice =
                      Number(defaultVariant?.price) || minPrice || 0

                    // Get MSRP values (also strings from API)
                    const variantMsrps =
                      product.variants
                        ?.map((v) => Number(v.msrp))
                        .filter((m) => m > 0) ?? []
                    const highestMsrp =
                      variantMsrps.length > 0 ? Math.max(...variantMsrps) : 0

                    // Calculate discount from highest MSRP vs lowest price
                    const discountPercent =
                      highestMsrp && highestMsrp > minPrice
                        ? Math.round(
                            ((highestMsrp - minPrice) / highestMsrp) * 100,
                          )
                        : 0

                    return (
                      <CarouselItem key={product.id} className="h-full">
                        <Card className="relative size-full overflow-hidden rounded-lg">
                          <CardContent className="p-0">
                            <div className="relative size-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                              <img
                                src={primaryImage?.url ?? '/placeholder.png'}
                                alt={primaryImage?.altText ?? product.name}
                                className="h-[500px] w-full object-contain"
                                loading="lazy"
                              />
                            </div>
                            {/* Enhanced gradient overlay for better text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                            <div className="absolute inset-0 flex flex-col justify-end p-8">
                              <div className="relative z-10 max-w-md space-y-4">
                                <h2 className="text-4xl font-bold text-white drop-shadow-lg">
                                  {product.name}
                                </h2>
                                <p className="line-clamp-2 text-lg text-white/90 drop-shadow-md">
                                  {product.shortDescription ??
                                    'Sản phẩm chính hãng, bảo hành toàn quốc, giao hàng nhanh chóng.'}
                                </p>
                                <div className="flex flex-wrap items-center gap-3">
                                  {hasMultiplePrices ? (
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-2xl font-semibold text-white/80 drop-shadow-lg">
                                        Từ
                                      </span>
                                      <span className="text-4xl font-bold text-white drop-shadow-lg">
                                        {formatCurrency(displayPrice)}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-4xl font-bold text-white drop-shadow-lg">
                                      {formatCurrency(displayPrice)}
                                    </span>
                                  )}
                                  {discountPercent > 0 && (
                                    <>
                                      {highestMsrp && (
                                        <span className="text-lg text-white/60 line-through drop-shadow-md">
                                          {formatCurrency(highestMsrp)}
                                        </span>
                                      )}
                                      <Badge className="bg-red-500 font-bold text-white shadow-lg">
                                        -{discountPercent}%
                                      </Badge>
                                    </>
                                  )}
                                </div>
                                <Button
                                  size="lg"
                                  onClick={() =>
                                    navigate(`/product-detail/${product.sku}`)
                                  }
                                  className="cursor-pointer rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600"
                                >
                                  Mua ngay
                                </Button>
                              </div>
                            </div>

                            <div className="absolute end-8 top-8 flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
                              <Flame className="size-4" /> Nổi bật
                            </div>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    )
                  })}
                </CarouselContent>
              </Carousel>

              {/* Dots Navigation */}
              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-white/20 p-2 backdrop-blur-md">
                {featuredProducts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      api?.scrollTo(index)
                      setCurrentSlide(index)
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentSlide === index
                        ? 'w-8 bg-emerald-500 shadow-lg shadow-emerald-500/50'
                        : 'w-2 bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={currentSlide === index ? 'step' : undefined}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
