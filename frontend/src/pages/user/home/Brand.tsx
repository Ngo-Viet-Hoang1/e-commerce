import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { DEFAULT_IMAGE_URL, SORT_ORDER } from '@/constants'
import { useBrands } from '@/pages/user/product-catalog/brand.queries'
import { useAllCatalogProducts } from '@/pages/user/product-catalog/product.queries'
import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

export default function ProductCategory() {
  const params = useMemo(
    () => ({ page: 1, limit: 100, sort: 'name', order: SORT_ORDER.ASC }),
    [],
  )
  const { data } = useBrands(params)
  const brands = useMemo(() => data?.data ?? [], [data?.data])
  const productParams = useMemo(
    () => ({ page: 1, limit: 100, sort: 'createdAt', order: SORT_ORDER.DEST }),
    [],
  )
  const { data: allProducts } = useAllCatalogProducts(productParams)
  const brandCounts = useMemo(() => {
    const counts = new Map<number, number>()
    allProducts?.forEach((product) => {
      const brandId = product.brandId ?? product.brand?.id
      if (brandId) {
        counts.set(brandId, (counts.get(brandId) ?? 0) + 1)
      }
    })
    return counts
  }, [allProducts])
  const brandCards = useMemo(
    () =>
      brands.map((brand) => ({
        id: brand.id,
        name: brand.name,
        description: brand.description ?? 'Đang cập nhật',
        itemCount: brandCounts.get(brand.id) ?? 0,
        image: brand.logoUrl ?? DEFAULT_IMAGE_URL,
        trending: false,
      })),
    [brands, brandCounts],
  )

  return (
    <section className="py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-balance">
          Mua sắm theo thương hiệu
        </h2>
        <p className="mt-3">
          Khám phá sản phẩm từ các thương hiệu phổ biến nhất
        </p>
      </div>

      <Carousel>
        <CarouselContent>
          {brandCards.map((brand) => (
            <CarouselItem
              key={brand.id}
              className="basis-full pl-2 sm:basis-1/2 md:pl-3 lg:basis-1/3"
            >
              <Card className="group cursor-pointer overflow-hidden py-0 transition-all duration-500 hover:shadow-md">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/35 to-transparent" />
                  <div className="absolute inset-0 bg-black/10" />

                  {brand.trending && (
                    <Badge className="absolute top-3 left-3 text-xs">
                      Nổi bật
                    </Badge>
                  )}

                  <div className="absolute right-0 bottom-0 left-0 p-3 text-white">
                    <h3 className="mb-1 text-lg font-semibold">
                      {brand.name}
                    </h3>
                    <p className="mb-2 text-sm text-white/90">
                      {brand.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        {brand.itemCount.toLocaleString()} sản phẩm
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 cursor-pointer border-white/30 bg-white/20 px-2 text-sm text-white backdrop-blur-sm hover:bg-white/30"
                        asChild
                      >
                        <Link to={`/product-catalog?brandId=${brand.id}`}>
                          Xem thêm
                          <ArrowRight className="ms-2 size-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden lg:flex" />
        <CarouselNext className="hidden lg:flex" />
      </Carousel>
    </section>
  )
}
