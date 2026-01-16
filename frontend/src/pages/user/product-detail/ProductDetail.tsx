import ImageCarousel_Basic, {
  type CarouselImage,
} from '@/components/commerce-ui/image-carousel-basic'
import ProductCard from '@/components/common/product-card/ProductCard'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { DEFAULT_IMAGE_URL } from '@/constants'
import { useProductVariants } from '@/hooks/useProductVariants'
import { useAddToCart } from '@/hooks/useCart'
import type { Product, ProductVariant } from '@/interfaces/product.interface'
import {
  useProductBySlug,
  useProductsByBrand,
} from '@/pages/admin/ProductManagement/product.queries'
import { useParams, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { ProductInfo } from './ProductInfo'
import { ProductTabs } from './ProductTabs'
import { useAuthStore } from '@/store/zustand/useAuthStore'
import { toast } from 'sonner'

const getProductImageUrl = (product: Product) => {
  const variantImages =
    product.variants?.flatMap((variant) => variant.productImages ?? []) ?? []
  const image = product.productImages?.[0] ?? variantImages[0]
  return image?.url ?? DEFAULT_IMAGE_URL
}

const getProductPriceRange = (product: Product) => {
  const variantPrices = product.variants?.map((variant) => variant.price) ?? []
  const fallbackMinPrice =
    variantPrices.length > 0 ? Math.min(...variantPrices) : 0
  const fallbackMaxPrice =
    variantPrices.length > 0 ? Math.max(...variantPrices) : undefined
  const minPrice = product.minPrice ?? fallbackMinPrice
  const maxPrice =
    fallbackMaxPrice !== undefined && fallbackMaxPrice > minPrice
      ? fallbackMaxPrice
      : undefined

  return { minPrice, maxPrice }
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isPending } = useProductBySlug(slug!)

  if (isPending) return <ProductDetailSkeleton />

  if (!data?.data) return <ProductNotFound />

  return <ProductDetailContent product={data.data} />
}

function ProductDetailContent({ product }: { product: Product }) {
  const navigate = useNavigate()
  const addToCart = useAddToCart()
  const { isAuthenticated } = useAuthStore()
  const brandId = product.brandId ?? product.brand?.id
  const { data: brandProductsData, isPending: isBrandPending } =
    useProductsByBrand(brandId, 8)
  const brandProducts = useMemo(() => {
    const items = brandProductsData?.data ?? []
    return items.filter((item) => item.id !== product.id)
  }, [brandProductsData?.data, product.id])
  const showBrandSection = Boolean(
    brandId && (isBrandPending ? true : brandProducts.length > 0),
  )

  const {
    attributes,
    selectedAttrs,
    setSelectedAttrs,
    selectedVariant,
    isOptionDisabled,
  } = useProductVariants(product)

  const images = [
    ...(product.productImages ?? []),
    ...(product.variants?.flatMap((v) => v.productImages ?? []) ?? []),
  ]
  const carouselImages: CarouselImage[] = images.map((img) => ({
    url: img.url,
    title: img.altText ?? product.name,
  }))

  const handleAddToCart = (variant: ProductVariant, quantity: number) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng')
      navigate('/auth/login', { state: { from: window.location.pathname } })
      return
    }

    addToCart.mutate({
      productId: product.id,
      variantId: variant.id,
      quantity,
    })
  }

  const handleBuyNow = (variant: ProductVariant, quantity: number) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua hàng')
      navigate('/auth/login', { state: { from: window.location.pathname } })
      return
    }

    // Add to cart first, then navigate to checkout
    addToCart.mutate(
      {
        productId: product.id,
        variantId: variant.id,
        quantity,
      },
      {
        onSuccess: () => {
          navigate('/checkout')
        },
      },
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto">
        <div className="grid gap-8 lg:grid-cols-2">
          {!carouselImages.length ? (
            <div className="bg-muted flex aspect-square items-center justify-center rounded-lg border">
              <p className="text-muted-foreground">Không có hình ảnh</p>
            </div>
          ) : (
            <ImageCarousel_Basic
              images={carouselImages}
              aspectRatio="square"
              imageFit="cover"
              thumbPosition="bottom"
              opts={{
                loop: true,
                align: 'start',
              }}
            />
          )}

          <ProductInfo
            product={product}
            attributes={attributes}
            selectedAttrs={selectedAttrs}
            setSelectedAttrs={setSelectedAttrs}
            selectedVariant={selectedVariant}
            isOptionDisabled={isOptionDisabled}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            isAddingToCart={addToCart.isPending}
          />
        </div>

        <div className="mt-16">
          <ProductTabs product={product} />
        </div>

        {showBrandSection && (
          <section className="mt-16 space-y-6">
            <header className="space-y-2">
              <h2 className="text-2xl font-bold">
                {product.brand?.name
                  ? `Gợi ý từ ${product.brand.name}`
                  : 'Gợi ý cùng thương hiệu'}
              </h2>
              <p className="text-muted-foreground text-sm">
                Các sản phẩm khác thuộc cùng thương hiệu bạn đang xem.
              </p>
            </header>

            <Carousel>
              <CarouselContent>
                {isBrandPending
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <CarouselItem
                        key={`brand-skeleton-${index}`}
                        className="basis-full pl-2 sm:basis-1/2 md:pl-4 lg:basis-1/3 xl:basis-1/4"
                      >
                        <Skeleton className="min-h-80 w-full rounded-xl" />
                      </CarouselItem>
                    ))
                  : brandProducts.map((item) => {
                      const { minPrice, maxPrice } = getProductPriceRange(item)
                      return (
                        <CarouselItem
                          key={item.id}
                          className="basis-full pl-2 sm:basis-1/2 md:pl-4 lg:basis-1/3 xl:basis-1/4"
                        >
                          <ProductCard
                            productName={item.name}
                            sku={item.sku}
                            imageUrl={getProductImageUrl(item)}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                          />
                        </CarouselItem>
                      )
                    })}
              </CarouselContent>
              <CarouselPrevious className="hidden lg:flex" />
              <CarouselNext className="hidden lg:flex" />
            </Carousel>
          </section>
        )}
      </div>
    </div>
  )
}

function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Không tìm thấy sản phẩm</h1>
      <p className="text-muted-foreground mt-2">
        Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
      </p>
      <a
        href="/products"
        className="text-primary mt-4 inline-block hover:underline"
      >
        Quay lại danh sách sản phẩm
      </a>
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      <div className="border-b">
        <div className="container mx-auto px-4 py-3">
          <Skeleton className="h-5 w-64" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="mt-2 h-5 w-1/2" />
            </div>
            <Skeleton className="h-12 w-1/3" />
            <div className="space-y-3">
              <Skeleton className="h-6 w-24" />
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-20" />
                ))}
              </div>
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
