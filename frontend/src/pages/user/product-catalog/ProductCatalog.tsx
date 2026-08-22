import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { DEFAULT_IMAGE_URL, SORT_ORDER } from '@/shared/constants'
import ProductCard from '@/entities/product'
import type { Brand } from '@/entities/brand'
import type { Category } from '@/entities/category'
import type { Product } from '@/entities/product'
import {
  useAddFavorite,
  useFavoriteProducts,
  useRemoveFavorite,
} from '@/features/wishlist'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import CategoryFilter, {
  type BrandOption,
  type CategoryOption,
  type PriceRangeOption,
} from './CategoryFilter'
import { useBrands } from './brand.queries'
import { useCategories } from './category.queries'
import { useAllCatalogProducts } from './product.queries'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/features/auth'
import { PackageSearch, RotateCcw } from 'lucide-react'

export default function ProductCatalog() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const searchQuery = searchParams.get('search') ?? ''
  const initialBrand = Number(searchParams.get('brandId'))
  const initialBrandFilter =
    Number.isFinite(initialBrand) && initialBrand > 0 ? initialBrand : 'all'

  const [page, setPage] = useState(1)
  const [limit] = useState(12)
  const [selectedSort, setSelectedSort] = useState('featured')
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all')
  const [selectedPriceRange, setSelectedPriceRange] = useState('all')
  const [selectedBrand, setSelectedBrand] = useState<number | 'all'>(initialBrandFilter)

  const allProductsParams = useMemo(
    () => ({ page: 1, limit: 100, sort: 'createdAt', order: SORT_ORDER.DEST }),
    [],
  )
  const {
    data: allProductsData,
    isPending,
    error,
  } = useAllCatalogProducts(allProductsParams)

  const categoryParams = useMemo(
    () => ({ page: 1, limit: 100, sort: 'name', order: SORT_ORDER.ASC }),
    [],
  )
  const { data: categoryData } = useCategories(categoryParams)

  const brandParams = useMemo(
    () => ({ page: 1, limit: 100, sort: 'name', order: SORT_ORDER.ASC }),
    [],
  )
  const { data: brandData } = useBrands(brandParams)

  const { data: favoritesData } = useFavoriteProducts()
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()
  const [pendingFavoriteId, setPendingFavoriteId] = useState<number | null>(null)

  const allProducts = useMemo<Product[]>(
    () => allProductsData ?? [],
    [allProductsData],
  )
  const categories = useMemo(
    () => categoryData?.data ?? [],
    [categoryData?.data],
  )
  const brands = useMemo(() => brandData?.data ?? [], [brandData?.data])
  
  const favoriteIds = useMemo(() => {
    return new Set((favoritesData?.data ?? []).map((product: Product) => product.id))
  }, [favoritesData?.data])

  const handleToggleFavorite = (productId: number, isFavorite: boolean) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích')
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

  const priceRanges: PriceRangeOption[] = useMemo(
    () => [
      { id: 'all', label: 'Tất cả mức giá', min: 0, max: null },
      { id: 'under-5m', label: 'Dưới 5 triệu', min: 0, max: 5_000_000 },
      { id: '5-10m', label: '5 - 10 triệu', min: 5_000_000, max: 10_000_000 },
      {
        id: '10-20m',
        label: '10 - 20 triệu',
        min: 10_000_000,
        max: 20_000_000,
      },
      { id: 'over-20m', label: '20 triệu trở lên', min: 20_000_000, max: null },
    ],
    [],
  )

  const totalProducts = allProducts.length
  const categoryCounts = useMemo(() => {
    const counts = new Map<number, number>()
    allProducts.forEach((product) => {
      const categoryId = product.categoryId ?? product.category?.id
      if (categoryId) {
        counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1)
      }
    })
    return counts
  }, [allProducts])

  const brandCounts = useMemo(() => {
    const counts = new Map<number, number>()
    allProducts.forEach((product) => {
      const brandId = product.brandId ?? product.brand?.id
      if (brandId) {
        counts.set(brandId, (counts.get(brandId) ?? 0) + 1)
      }
    })
    return counts
  }, [allProducts])

  const categoryOptions: CategoryOption[] = useMemo(() => {
    const dbCategories = (categories as Category[]).map((category) => ({
      id: category.id,
      name: category.name,
      count: categoryCounts.get(category.id),
    }))
    return [
      { id: 'all', name: 'Tất cả danh mục', count: totalProducts },
      ...dbCategories,
    ]
  }, [categories, categoryCounts, totalProducts])

  const brandOptions: BrandOption[] = useMemo(() => {
    const dbBrands = (brands as Brand[]).map((brand) => ({
      id: brand.id,
      name: brand.name,
      count: brandCounts.get(brand.id),
    }))
    return [{ id: 'all', name: 'Tất cả thương hiệu' }, ...dbBrands]
  }, [brands, brandCounts])

  const selectedPrice = useMemo(
    () => priceRanges.find((range) => range.id === selectedPriceRange),
    [priceRanges, selectedPriceRange],
  )

  // Filter products by Search, Category, Brand, Price
  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return allProducts.filter((product) => {
      // 1. Search Query Matching (Name, SKU, Description)
      if (normalizedSearch) {
        const nameMatch = product.name?.toLowerCase().includes(normalizedSearch)
        const skuMatch = product.sku?.toLowerCase().includes(normalizedSearch)
        const descMatch = product.description?.toLowerCase().includes(normalizedSearch)
        const shortDescMatch = product.shortDescription?.toLowerCase().includes(normalizedSearch)
        if (!nameMatch && !skuMatch && !descMatch && !shortDescMatch) {
          return false
        }
      }

      // 2. Category Filter
      const categoryId = product.categoryId ?? product.category?.id
      const matchesCategory =
        selectedCategory === 'all' || categoryId === selectedCategory
      if (!matchesCategory) return false

      // 3. Brand Filter
      const brandId = product.brandId ?? product.brand?.id
      const matchesBrand = selectedBrand === 'all' || brandId === selectedBrand
      if (!matchesBrand) return false

      // 4. Price Filter
      if (!selectedPrice || selectedPrice.id === 'all') {
        return true
      }

      const variantPrices =
        product.variants?.map((variant) => variant.price) ?? []
      const fallbackMinPrice =
        variantPrices.length > 0 ? Math.min(...variantPrices) : undefined
      const priceValue = product.minPrice ?? fallbackMinPrice

      if (priceValue === undefined || priceValue === null) {
        return false
      }

      const matchesPrice =
        selectedPrice.max === null
          ? priceValue >= selectedPrice.min
          : priceValue >= selectedPrice.min && priceValue < selectedPrice.max

      return matchesPrice
    })
  }, [allProducts, searchQuery, selectedCategory, selectedBrand, selectedPrice])

  const sortedProducts = useMemo(() => {
    const items = [...filteredProducts]
    if (selectedSort === 'price-low') {
      return items.sort((a, b) => {
        const aPrice =
          a.minPrice ??
          Math.min(...(a.variants?.map((variant) => variant.price) ?? [0]))
        const bPrice =
          b.minPrice ??
          Math.min(...(b.variants?.map((variant) => variant.price) ?? [0]))
        return aPrice - bPrice
      })
    }
    if (selectedSort === 'price-high') {
      return items.sort((a, b) => {
        const aPrice =
          a.minPrice ??
          Math.min(...(a.variants?.map((variant) => variant.price) ?? [0]))
        const bPrice =
          b.minPrice ??
          Math.min(...(b.variants?.map((variant) => variant.price) ?? [0]))
        return bPrice - aPrice
      })
    }
    return items
  }, [filteredProducts, selectedSort])

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / limit))
  const currentPage = Math.min(page, totalPages)
  const pagedProducts = useMemo(() => {
    const start = (currentPage - 1) * limit
    return sortedProducts.slice(start, start + limit)
  }, [currentPage, limit, sortedProducts])

  const handleCategoryChange = (value: number | 'all') => {
    setSelectedCategory(value)
    setPage(1)
  }

  const handlePriceRangeChange = (value: string) => {
    setSelectedPriceRange(value)
    setPage(1)
  }

  const handleBrandChange = (value: number | 'all') => {
    setSelectedBrand(value)
    setPage(1)
  }

  const handleSortChange = (value: string) => {
    setSelectedSort(value)
    setPage(1)
  }

  const handleClearSearch = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('search')
    setSearchParams(nextParams)
    setPage(1)
  }

  const handleClearAll = () => {
    setSelectedCategory('all')
    setSelectedPriceRange('all')
    setSelectedBrand('all')
    navigate('/product-catalog')
    setPage(1)
  }

  return (
    <div className="bg-white dark:bg-gray-950 py-4">
      <h1 className="sr-only">Danh mục sản phẩm</h1>

      <CategoryFilter
        categories={categoryOptions}
        priceRanges={priceRanges}
        brands={brandOptions}
        selectedCategory={selectedCategory}
        selectedPriceRange={selectedPriceRange}
        selectedBrand={selectedBrand}
        selectedSort={selectedSort}
        searchQuery={searchQuery}
        showingCount={sortedProducts.length}
        onCategoryChange={handleCategoryChange}
        onPriceRangeChange={handlePriceRangeChange}
        onBrandChange={handleBrandChange}
        onSortChange={handleSortChange}
        onClearSearch={handleClearSearch}
        onClearAll={handleClearAll}
      />

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8 min-h-[300px]">
        {isPending &&
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="group">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="mt-4 h-4 w-2/3" />
              <Skeleton className="mt-2 h-5 w-1/3" />
            </div>
          ))}

        {!isPending && error && (
          <div className="col-span-full py-12 text-center text-sm text-red-500">
            Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.
          </div>
        )}

        {!isPending && !error && pagedProducts.length === 0 && (
          <div className="col-span-full py-16 text-center space-y-4">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
              <PackageSearch className="size-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">
                Không tìm thấy sản phẩm nào
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {searchQuery
                  ? `Không có kết quả phù hợp với từ khóa "${searchQuery}". Vui lòng thử từ khóa khác hoặc xóa bộ lọc.`
                  : 'Không có sản phẩm nào phù hợp với các tiêu chí bộ lọc bạn đã chọn.'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="gap-2 cursor-pointer"
            >
              <RotateCcw className="size-4" />
              Xóa bộ lọc & Xem tất cả sản phẩm
            </Button>
          </div>
        )}

        {!isPending &&
          !error &&
          pagedProducts.map((product: Product) => {
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
              <div key={product.id} className="h-full">
                <ProductCard
                  productName={product.name}
                  sku={product.sku}
                  imageUrl={imageSrc}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  isWishlisted={isFavorite}
                  onToggleWishlist={() =>
                    handleToggleFavorite(product.id, isFavorite)
                  }
                />
              </div>
            )
          })}
      </div>

      {/* Pagination */}
      {!isPending && !error && totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            className="cursor-pointer"
          >
            Trang trước
          </Button>
          <span className="text-muted-foreground text-sm font-medium px-2">
            Trang {currentPage} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
            className="cursor-pointer"
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  )
}
