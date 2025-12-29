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

const categories = [
  { id: 'all', name: 'All Products', count: 1247 },
  { id: 'electronics', name: 'Electronics', count: 324 },
  { id: 'clothing', name: 'Clothing', count: 189 },
  { id: 'home', name: 'Home & Garden', count: 156 },
  { id: 'books', name: 'Books', count: 97 },
  { id: 'sports', name: 'Sports', count: 134 },
  { id: 'toys', name: 'Toys', count: 78 },
  { id: 'health', name: 'Health & Beauty', count: 112 },
]

const priceRanges = [
  { id: 'all', label: 'All Prices', min: 0, max: null },
  { id: 'under-25', label: 'Under $25', min: 0, max: 25 },
  { id: '25-50', label: '$25 - $50', min: 25, max: 50 },
  { id: '50-100', label: '$50 - $100', min: 50, max: 100 },
  { id: 'over-100', label: 'Over $100', min: 100, max: null },
]

const sortOptions = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'rating', label: 'Customer Rating' },
]

export default function CategoryFilter() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPriceRange, setSelectedPriceRange] = useState('all')
  const [selectedSort, setSelectedSort] = useState('featured')
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
  if (searchQuery) {
    activeFilters.push({
      type: 'search',
      label: `"${searchQuery}"`,
      value: searchQuery,
    })
  }

  const clearFilter = (type: string) => {
    if (type === 'category') setSelectedCategory('all')
    if (type === 'price') setSelectedPriceRange('all')
    if (type === 'search') setSearchQuery('')
  }

  const clearAllFilters = () => {
    setSelectedCategory('all')
    setSelectedPriceRange('all')
    setSearchQuery('')
  }

  return (
    <section className="pb-8">
      {/* Horizontal Filter Bar */}
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
                  onClick={() => setSelectedCategory(category.id)}
                  className={
                    selectedCategory === category.id ? 'bg-accent' : ''
                  }
                >
                  <div className="flex w-full items-center justify-between">
                    <span>{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
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
                  onClick={() => setSelectedPriceRange(range.id)}
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
              Showing{' '}
              {categories.find((c) => c.id === selectedCategory)?.count ?? 1247}{' '}
              results
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
                    onClick={() => setSelectedSort(option.id)}
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
