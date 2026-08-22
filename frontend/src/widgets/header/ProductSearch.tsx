import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Loader2, PackageSearch, Search, X } from 'lucide-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Input } from '@/shared/ui/input'
import { useDebounce } from '@/shared/hooks'
import { ProductService, type Product } from '@/entities/product'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency } from '@/shared/utils/format'
import { DEFAULT_IMAGE_URL } from '@/shared/constants'

export default function ProductSearch() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const currentSearch = searchParams.get('search') ?? ''

  const [query, setQuery] = useState(currentSearch)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(query.trim(), 300)

  useEffect(() => {
    if (location.pathname === '/product-catalog') {
      setQuery(currentSearch)
    }
  }, [location.pathname, currentSearch])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Live search query for instant preview
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['live-product-search', debouncedQuery],
    queryFn: () => ProductService.getPaginated({ search: debouncedQuery, limit: 5 }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000,
  })

  const previewProducts = searchResults?.data ?? []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsOpen(false)
    const trimmed = query.trim()
    if (trimmed) {
      navigate(`/product-catalog?search=${encodeURIComponent(trimmed)}`)
    } else if (location.pathname === '/product-catalog') {
      navigate('/product-catalog')
    }
  }

  const handleClear = () => {
    setQuery('')
    setIsOpen(false)
    if (location.pathname === '/product-catalog' && currentSearch) {
      navigate('/product-catalog')
    }
  }

  const handleSelectProduct = (sku: string) => {
    setIsOpen(false)
    navigate(`/product-detail/${sku}`)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSearch} className="relative w-full">
        <Input
          type="text"
          placeholder="Tìm kiếm sản phẩm, thương hiệu..."
          value={query}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true)
          }}
          onChange={(e) => {
            setQuery(e.target.value)
            if (e.target.value.trim().length >= 2) {
              setIsOpen(true)
            } else {
              setIsOpen(false)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false)
          }}
          className="w-full pl-10 pr-9 py-2 rounded-xl bg-muted/50 border border-input focus:bg-background transition-all shadow-xs"
          aria-label="Tìm kiếm sản phẩm"
        />
        <button
          type="submit"
          aria-label="Tìm kiếm"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Search className="h-4 w-4" />
        </button>
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Xóa từ khóa tìm kiếm"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-0.5 rounded-full hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </form>

      {/* Instant Live Search Dropdown Popup */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border bg-popover/95 backdrop-blur-md shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
          <div className="p-2 border-b bg-muted/30 flex items-center justify-between text-xs text-muted-foreground px-3">
            <span>Gợi ý tìm kiếm cho &ldquo;<strong>{query.trim()}</strong>&rdquo;</span>
            {isLoading && <Loader2 className="size-3.5 animate-spin text-primary" />}
          </div>

          <div className="max-h-[380px] overflow-y-auto py-1 divide-y divide-border/50">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-3 animate-pulse">
                    <div className="size-12 rounded-lg bg-muted shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : previewProducts.length > 0 ? (
              previewProducts.map((product: Product) => {
                const variantImages = product.variants?.flatMap(
                  (v) => v.productImages ?? [],
                )
                const imageSrc =
                  product.productImages?.find((img) => img.isPrimary)?.url ??
                  product.productImages?.[0]?.url ??
                  variantImages?.[0]?.url ??
                  DEFAULT_IMAGE_URL

                const variantPrices =
                  product.variants?.map((v) => Number(v.price)) ?? []
                const price =
                  product.minPrice ??
                  (variantPrices.length > 0 ? Math.min(...variantPrices) : 0)

                return (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product.sku)}
                    className="flex items-center gap-3.5 p-3 hover:bg-accent/80 transition-colors cursor-pointer group"
                  >
                    <img
                      src={imageSrc}
                      alt={product.name}
                      className="size-12 rounded-lg object-contain bg-white border p-1 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        {product.brand?.name && <span>{product.brand.name}</span>}
                        {product.brand?.name && <span>•</span>}
                        <span>SKU: {product.sku}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(price)}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-6 text-center space-y-2">
                <PackageSearch className="size-8 mx-auto text-muted-foreground/60" />
                <p className="text-sm font-medium text-foreground">
                  Không tìm thấy sản phẩm nào
                </p>
                <p className="text-xs text-muted-foreground">
                  Nhấn <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[10px]">Enter</kbd> để tìm kiếm chi tiết trong danh mục
                </p>
              </div>
            )}
          </div>

          {/* Footer CTA: View All in Catalog */}
          <div
            onClick={handleSearch}
            className="p-3 bg-muted/40 hover:bg-primary/10 border-t flex items-center justify-between text-xs font-semibold text-primary transition-colors cursor-pointer"
          >
            <span>Xem tất cả kết quả cho &ldquo;{query.trim()}&rdquo;</span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-muted-foreground font-normal">Nhấn Enter</span>
              <ArrowRight className="size-3.5" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
