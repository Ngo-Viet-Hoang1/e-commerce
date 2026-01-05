import ImageCarousel_Basic, {
  type CarouselImage,
} from '@/components/commerce-ui/image-carousel-basic'
import { Skeleton } from '@/components/ui/skeleton'
import { useProductVariants } from '@/hooks/useProductVariants'
import type { Product, ProductVariant } from '@/interfaces/product.interface'
import { useProductBySlug } from '@/pages/admin/ProductManagement/product.queries'
import { useParams } from 'react-router-dom'
import { ProductInfo } from './ProductInfo'
import { ProductTabs } from './ProductTabs'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isPending } = useProductBySlug(slug!)

  if (isPending) return <ProductDetailSkeleton />

  if (!data?.data) return <ProductNotFound />

  return <ProductDetailContent product={data.data} />
}

function ProductDetailContent({ product }: { product: Product }) {
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
    // TODO: Implement cart logic
    // Example: addToCart({ variantId: variant.id, quantity })
  }

  const handleBuyNow = (variant: ProductVariant, quantity: number) => {
    // TODO: Implement buy now logic
    // Example: router.push('/checkout')
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
          />
        </div>

        <div className="mt-16">
          <ProductTabs product={product} />
        </div>
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
