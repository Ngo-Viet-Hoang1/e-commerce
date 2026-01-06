'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'

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
  showingCount: number
  onCategoryChange: (value: number | 'all') => void
  onPriceRangeChange: (value: string) => void
  onBrandChange: (value: number | 'all') => void
  onSortChange: (value: string) => void
}

const sortOptions = [
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
]

export default function CategoryFilter({
  categories,
  priceRanges,
  brands,
  selectedCategory,
  selectedPriceRange,
  selectedBrand,
  selectedSort,
  showingCount,
  onCategoryChange,
  onPriceRangeChange,
  onBrandChange,
  onSortChange,
}: CategoryFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const activeFilters = []
  if (selectedCategory !== 'all') {
    const category = categories.find((c) => c.id === selectedCategory)
    if (category)
      activeFilters.push({
        type: 'category',
        label: category.name,
        value: selectedCategory,
      })
  }
  if (selectedPriceRange !== 'all') {
    const priceRange = priceRanges.find((p) => p.id === selectedPriceRange)
    if (priceRange)
      activeFilters.push({
        type: 'price',
        label: priceRange.label,
        value: selectedPriceRange,
      })
  }
  if (selectedBrand !== 'all') {
    const brand = brands.find((b) => b.id === selectedBrand)
    if (brand)
      activeFilters.push({
        type: 'brand',
        label: brand.name,
        value: selectedBrand,
      })
  }
  if (searchQuery) {
    activeFilters.push({
      type: 'search',
      label: `"${searchQuery}"`,
      value: searchQuery,
    })
  }

  const clearFilter = (type: string) => {
    if (type === 'category') onCategoryChange('all')
    if (type === 'price') onPriceRangeChange('all')
    if (type === 'brand') onBrandChange('all')
    if (type === 'search') setSearchQuery('')
  }

  const clearAllFilters = () => {
    onCategoryChange('all')
    onPriceRangeChange('all')
    onBrandChange('all')
    setSearchQuery('')
  }

  return (
    <section className="pb-8">
      <div className="mb-6 space-y-4">
        {/* Search and Sort Row */}
        {/* Category and Price Filter Row */}
        <div className="flex flex-wrap gap-3">
          {/* Category Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="cursor-pointer">
                Category:{' '}
                {categories.find((c) => c.id === selectedCategory)?.name}
                <ChevronDown className="ms-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={
                    selectedCategory === category.id ? 'bg-accent' : ''
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="cursor-pointer">
                Brand: {brands.find((b) => b.id === selectedBrand)?.name}
                <ChevronDown className="ms-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {brands.map((brand) => (
                <DropdownMenuItem
                  key={brand.id}
                  onClick={() => onBrandChange(brand.id)}
                  className={selectedBrand === brand.id ? 'bg-accent' : ''}
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
                Price:{' '}
                {priceRanges.find((p) => p.id === selectedPriceRange)?.label}
                <ChevronDown className="ms-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {priceRanges.map((range) => (
                <DropdownMenuItem
                  key={range.id}
                  onClick={() => onPriceRangeChange(range.id)}
                  className={selectedPriceRange === range.id ? 'bg-accent' : ''}
                >
                  {range.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-sm font-medium">
              Active filters:
            </span>
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="secondary">
                {filter.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto cursor-pointer p-1! text-inherit"
                  onClick={() => clearFilter(filter.type)}
                >
                  <X className="size-3" />
                </Button>
              </Badge>
            ))}
            <DropdownMenuSeparator className="mx-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground h-auto cursor-pointer p-1.5 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="bg-muted/50 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              Showing {showingCount} results
            </span>
            {searchQuery && (
              <span className="text-muted-foreground text-sm">
                for "{searchQuery}"
              </span>
            )}
          </div>
          <div className="text-muted-foreground text-xs">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="ml-auto w-full cursor-pointer sm:w-auto"
                >
                  <SlidersHorizontal className="me-2 size-4" />
                  Sort: {sortOptions.find((s) => s.id === selectedSort)?.label}
                  <ChevronDown className="ms-2 size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    onClick={() => onSortChange(option.id)}
                    className={selectedSort === option.id ? 'bg-accent' : ''}
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
