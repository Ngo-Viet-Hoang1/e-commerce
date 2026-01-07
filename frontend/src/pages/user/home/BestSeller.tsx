import ProductCard from '@/components/common/product-card/ProductCard'
import { DEFAULT_IMAGE_URL } from '@/constants'
import type { Order, OrderItem } from '@/interfaces/order.interface'
import type { Product } from '@/interfaces/product.interface'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import AdminOrderService from '@/api/services/admin/order.admin.service'
import ProductService from '@/api/services/user/product.service'
import {
  useAddFavorite,
  useFavoriteProducts,
  useRemoveFavorite,
} from '@/pages/user/profile/Favorite/favoriteProducts.queries'
import { useAuthStore } from '@/store/zustand/useAuthStore'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

const BEST_SELLER_LIMIT = 8
const ORDER_FETCH_LIMIT = 200
const ORDER_FIRST_PAGE = 1

const getBestSellerImage = (item: OrderItem) => {
  const images = item.variant?.productImages ?? item.product?.productImages
  if (!images || images.length === 0) return DEFAULT_IMAGE_URL
  const primary = images.find((image) => image.isPrimary)?.url
  const fallback = images[0]?.url
  return primary ?? fallback ?? DEFAULT_IMAGE_URL
}

const buildBestSellers = (orders: Order[]) => {
  const productMap = new Map<
    number,
    {
      productId: number
      productName: string
      sku: string
      imageUrl: string
      minPrice: number
      maxPrice: number
      totalQuantity: number
    }
  >()

  orders.forEach((order) => {
    order.orderItems?.forEach((item) => {
      const sku =
        item.product?.sku ?? item.variant?.sku ?? String(item.productId)
      const productName =
        item.product?.name ??
        item.variant?.title ??
        `Product #${item.productId}`

      const current = productMap.get(item.productId)
      const imageUrl = getBestSellerImage(item)
      const minPrice = item.unitPrice
      const maxPrice = item.unitPrice

      if (!current) {
        productMap.set(item.productId, {
          productId: item.productId,
          productName,
          sku,
          imageUrl,
          minPrice,
          maxPrice,
          totalQuantity: item.quantity,
        })
        return
      }

      current.totalQuantity += item.quantity
      current.minPrice = Math.min(current.minPrice, minPrice)
      current.maxPrice = Math.max(current.maxPrice, maxPrice)

      if (!current.imageUrl) {
        current.imageUrl = imageUrl
      }
    })
  })

  return Array.from(productMap.values())
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, BEST_SELLER_LIMIT)
}

const BestSeller = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { data } = useQuery({
    queryKey: ['best-sellers', 'orders', 'all'],
    queryFn: async () => {
      const orders: Order[] = []
      let page = ORDER_FIRST_PAGE
      let hasNextPage = true

      while (hasNextPage) {
        const response = await AdminOrderService.getPaginated({
          page,
          limit: ORDER_FETCH_LIMIT,
        })
        orders.push(...(response.data ?? []))
        hasNextPage = response.meta?.hasNextPage ?? false
        page += 1
      }

      return { data: orders }
    },
  })

  const bestSellers = useMemo(() => {
    return buildBestSellers(data?.data ?? [])
  }, [data])

  const bestSellerIds = useMemo(
    () => bestSellers.map((item) => item.productId),
    [bestSellers],
  )

  const { data: productDetails } = useQuery({
    queryKey: ['best-sellers', 'products', bestSellerIds],
    queryFn: async () => {
      const results = await Promise.all(
        bestSellerIds.map(async (id) => {
          try {
            const response = await ProductService.getById(id)
            return response.data
          } catch {
            return null
          }
        }),
      )
      return results.filter(Boolean) as Product[]
    },
    enabled: bestSellerIds.length > 0,
  })

  const productMap = useMemo(() => {
    return new Map(
      productDetails?.map((product) => [product.id, product]) ?? [],
    )
  }, [productDetails])

  const { data: favoritesData } = useFavoriteProducts()
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()
  const [pendingFavoriteId, setPendingFavoriteId] = useState<number | null>(
    null,
  )
  const favoriteIds = useMemo(() => {
    return new Set((favoritesData?.data ?? []).map((product) => product.id))
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
    return bestSellers.map((item) => {
      const product = productMap.get(item.productId)
      const variantImages = product?.variants?.flatMap(
        (variant) => variant.productImages ?? [],
      )
      const productImage =
        product?.productImages?.find((img) => img.isPrimary)?.url ??
        product?.productImages?.[0]?.url ??
        variantImages?.[0]?.url

      const imageUrl =
        item.imageUrl && item.imageUrl !== DEFAULT_IMAGE_URL
          ? item.imageUrl
          : (productImage ?? DEFAULT_IMAGE_URL)

      return {
        ...item,
        productName: product?.name ?? item.productName,
        sku: product?.sku ?? item.sku,
        minPrice: item.minPrice ?? product?.minPrice ?? item.minPrice,
        imageUrl,
      }
    })
  }, [bestSellers, productMap])

  return (
    <section className="space-y-8 py-12">
      <header className="space-y-2 text-center">
        <h2 className="text-3xl font-bold text-balance sm:text-4xl">
          Bán chạy nhất
        </h2>
        <p className="text-muted-foreground mx-auto max-w-[160ch] text-balance">
          Những sản phẩm được đặt mua nhiều nhất, luôn đảm bảo chất lượng và sự
          hài lòng của khách hàng.
        </p>
      </header>

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
    </section>
  )
}

export default BestSeller
