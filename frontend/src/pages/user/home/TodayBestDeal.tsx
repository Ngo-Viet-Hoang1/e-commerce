import ProductCard from '@/components/common/product-card/ProductCard'
import { DEFAULT_IMAGE_URL, SORT_ORDER } from '@/constants'
import type { Product } from '@/interfaces/product.interface'
import { useCatalogProducts } from '@/pages/user/product-catalog/product.queries'
import { useMemo, useState } from 'react'

const MAX_ITEMS = 20
const INITIAL_ITEMS = 10
const LOAD_STEP = 10
const PRODUCT_LIMIT = 50

const getTodayKey = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const hashString = (value: string) => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return hash >>> 0
}

const mulberry32 = (seed: number) => {
  let t = seed
  return () => {
    t += 0x6d2b79f5
    let result = Math.imul(t ^ (t >>> 15), 1 | t)
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

const seededShuffle = <T,>(items: T[], seed: number) => {
  const random = mulberry32(seed)
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const TodayBestDeal = () => {
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
  const dayKey = getTodayKey()
  const shuffledProducts = useMemo(() => {
    const products = data?.data ?? []
    if (products.length === 0) return []
    const seed = hashString(dayKey)
    return seededShuffle(products, seed).slice(0, MAX_ITEMS)
  }, [data?.data, dayKey])
  const displayedProducts = useMemo(
    () => shuffledProducts.slice(0, displayCount),
    [shuffledProducts, displayCount],
  )
  const canLoadMore = displayedProducts.length < shuffledProducts.length

  return (
    <section className="w-full py-12">
      <h2 className="mb-8 text-center text-2xl font-bold text-balance md:text-3xl">
        Ưu đãi tốt nhất hôm nay dành cho bạn!
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
        {displayedProducts.map((product: Product) => {
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
                Math.min(prev + LOAD_STEP, shuffledProducts.length, MAX_ITEMS),
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
