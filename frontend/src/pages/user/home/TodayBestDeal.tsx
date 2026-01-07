import ProductCard from '@/components/common/product-card/ProductCard'
import { DEFAULT_IMAGE_URL, SORT_ORDER } from '@/constants'
import type { Product } from '@/interfaces/product.interface'
import { useCatalogProducts } from '@/pages/user/product-catalog/product.queries'
import {
  useAddFavorite,
  useFavoriteProducts,
  useRemoveFavorite,
} from '@/pages/user/profile/Favorite/favoriteProducts.queries'
import { useAuthStore } from '@/store/zustand/useAuthStore'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

const MAX_ITEMS = 20
const INITIAL_ITEMS = 10
const LOAD_STEP = 10
const PRODUCT_LIMIT = 50

const TodayBestDeal = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const params = useMemo(
    () => ({
      page: 1,
      limit: PRODUCT_LIMIT,
      sort: 'createdAt',
      order: SORT_ORDER.DEST,
    }),
    [],
  )
  const { data } = useCatalogProducts(params)
  const [displayCount, setDisplayCount] = useState(INITIAL_ITEMS)
  const { data: favoritesData } = useFavoriteProducts()
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()
  const [pendingFavoriteId, setPendingFavoriteId] = useState<number | null>(
    null,
  )
  const products = useMemo(() => {
    return (data?.data ?? []).slice(0, MAX_ITEMS)
  }, [data?.data])
  const displayedProducts = useMemo(
    () => products.slice(0, displayCount),
    [products, displayCount],
  )
  const canLoadMore = displayedProducts.length < products.length
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

  return (
    <section className="w-full py-12">
      <h2 className="mb-8 text-center text-2xl font-bold text-balance md:text-3xl">
        Ưu đãi tốt nhất hôm nay dành cho bạn!
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
        {displayedProducts.map((product: Product) => {
          const isFavorite = favoriteIds.has(product.id)
          const variantImages =
            product.variants?.flatMap(
              (variant) => variant.productImages ?? [],
            ) ?? []
          const image = product.productImages?.[0] ?? variantImages[0]
          const imageSrc = image?.url ?? DEFAULT_IMAGE_URL
          const variantPrices =
            product.variants?.map((variant) => variant.price) ?? []
          const fallbackMinPrice =
            variantPrices.length > 0 ? Math.min(...variantPrices) : 0
          const fallbackMaxPrice =
            variantPrices.length > 0 ? Math.max(...variantPrices) : undefined
          const minPrice = product.minPrice ?? fallbackMinPrice
          const maxPrice =
            fallbackMaxPrice !== undefined && fallbackMaxPrice > minPrice
              ? fallbackMaxPrice
              : undefined

          return (
            <ProductCard
              key={product.id}
              imageUrl={imageSrc}
              productName={product.name}
              sku={product.sku}
              minPrice={minPrice}
              maxPrice={maxPrice}
              tagText="Ưu đãi tốt"
              isWishlisted={isFavorite}
              onToggleWishlist={() =>
                handleToggleFavorite(product.id, isFavorite)
              }
            />
          )
        })}
      </div>
      {canLoadMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setDisplayCount((prev) =>
                Math.min(prev + LOAD_STEP, products.length, MAX_ITEMS),
              )
            }
            className="rounded-full border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            Xem thêm sản phẩm
          </button>
        </div>
      )}
    </section>
  )
}

export default TodayBestDeal
