'use client'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'

export interface CategoryOption {
  id: number | 'all'
  name: string
  count?: number
}

export interface PriceRangeOption {
  id: string
  label: string
  min: number
  max: number | null
}

export interface BrandOption {
  id: number | 'all'
  name: string
  count?: number
}

interface CategoryFilterProps {
  categories: CategoryOption[]
  priceRanges: PriceRangeOption[]
  brands: BrandOption[]
  selectedCategory: number | 'all'
  selectedPriceRange: string
  selectedBrand: number | 'all'
  selectedSort: string
  searchQuery?: string
  showingCount: number
  onCategoryChange: (value: number | 'all') => void
  onPriceRangeChange: (value: string) => void
  onBrandChange: (value: number | 'all') => void
  onSortChange: (value: string) => void
  onClearSearch?: () => void
  onClearAll?: () => void
}

const sortOptions = [
  { id: 'featured', label: 'Nổi bật nhất' },
  { id: 'price-low', label: 'Giá: Thấp đến Cao' },
  { id: 'price-high', label: 'Giá: Cao đến Thấp' },
]

export default function CategoryFilter({
  categories,
  priceRanges,
  brands,
  selectedCategory,
  selectedPriceRange,
  selectedBrand,
  selectedSort,
  searchQuery = '',
  showingCount,
  onCategoryChange,
  onPriceRangeChange,
  onBrandChange,
  onSortChange,
  onClearSearch,
  onClearAll,
}: CategoryFilterProps) {
  const activeFilters = []
  if (selectedCategory !== 'all') {
    const category = categories.find((c) => c.id === selectedCategory)
    if (category)
      activeFilters.push({
        type: 'category',
        label: `Danh mục: ${category.name}`,
      })
  }
  if (selectedPriceRange !== 'all') {
    const priceRange = priceRanges.find((p) => p.id === selectedPriceRange)
    if (priceRange)
      activeFilters.push({
        type: 'price',
        label: `Giá: ${priceRange.label}`,
      })
  }
  if (selectedBrand !== 'all') {
    const brand = brands.find((b) => b.id === selectedBrand)
    if (brand)
      activeFilters.push({
        type: 'brand',
        label: `Thương hiệu: ${brand.name}`,
      })
  }
  if (searchQuery.trim()) {
    activeFilters.push({
      type: 'search',
      label: `Tìm kiếm: "${searchQuery.trim()}"`,
    })
  }

  const clearFilter = (type: string) => {
    if (type === 'category') onCategoryChange('all')
    if (type === 'price') onPriceRangeChange('all')
    if (type === 'brand') onBrandChange('all')
    if (type === 'search' && onClearSearch) onClearSearch()
  }

  const clearAllFilters = () => {
    if (onClearAll) {
      onClearAll()
    } else {
      onCategoryChange('all')
      onPriceRangeChange('all')
      onBrandChange('all')
      if (onClearSearch) onClearSearch()
    }
  }

  return (
    <section className="pb-8">
      <div className="mb-6 space-y-4">
        {/* Category, Brand, and Price Filter Row */}
        <div className="flex flex-wrap gap-3">
          {/* Category Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="cursor-pointer">
                Danh mục:{' '}
                {categories.find((c) => c.id === selectedCategory)?.name ?? 'Tất cả'}
                <ChevronDown className="ms-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={
                    selectedCategory === category.id ? 'bg-accent font-medium' : ''
                  }
                >
                  <div className="flex w-full items-center justify-between">
                    <span>{category.name}</span>
                    {typeof category.count === 'number' && (
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Brand Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="cursor-pointer">
                Thương hiệu:{' '}
                {brands.find((b) => b.id === selectedBrand)?.name ?? 'Tất cả'}
                <ChevronDown className="ms-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {brands.map((brand) => (
                <DropdownMenuItem
                  key={brand.id}
                  onClick={() => onBrandChange(brand.id)}
                  className={selectedBrand === brand.id ? 'bg-accent font-medium' : ''}
                >
                  <div className="flex w-full items-center justify-between">
                    <span>{brand.name}</span>
                    {typeof brand.count === 'number' && (
                      <Badge variant="secondary" className="text-xs">
                        {brand.count}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Price Range Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="cursor-pointer">
                Mức giá:{' '}
                {priceRanges.find((p) => p.id === selectedPriceRange)?.label ?? 'Tất cả'}
                <ChevronDown className="ms-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {priceRanges.map((range) => (
                <DropdownMenuItem
                  key={range.id}
                  onClick={() => onPriceRangeChange(range.id)}
                  className={selectedPriceRange === range.id ? 'bg-accent font-medium' : ''}
                >
                  {range.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Active Filters Bar */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-muted-foreground text-sm font-medium">
              Đang lọc theo:
            </span>
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="secondary" className="gap-1 px-2.5 py-1">
                {filter.label}
                <button
                  type="button"
                  className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors cursor-pointer"
                  onClick={() => clearFilter(filter.type)}
                  aria-label={`Xóa bộ lọc ${filter.label}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
            <DropdownMenuSeparator className="mx-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground h-auto cursor-pointer p-1.5 text-xs hover:text-foreground"
            >
              Xóa tất cả bộ lọc
            </Button>
          </div>
        )}
      </div>

      {/* Results Summary & Sorting Bar */}
      <div className="bg-muted/40 rounded-xl border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              Hiển thị {showingCount} sản phẩm
            </span>
            {searchQuery.trim() && (
              <span className="text-muted-foreground text-sm">
                cho từ khóa &ldquo;<strong className="text-foreground">{searchQuery.trim()}</strong>&rdquo;
              </span>
            )}
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                >
                  <SlidersHorizontal className="me-2 size-4" />
                  Sắp xếp:{' '}
                  {sortOptions.find((s) => s.id === selectedSort)?.label ?? 'Nổi bật nhất'}
                  <ChevronDown className="ms-2 size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    onClick={() => onSortChange(option.id)}
                    className={selectedSort === option.id ? 'bg-accent font-medium' : ''}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </section>
  )
}
