import { Search, PackageOpen } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useProducts } from '@/pages/admin/ProductManagement/product.queries'
import type { Product } from '@/interfaces/product.interface'
import useDebounce from '@/hooks/useDebounce'
import ProductSearchItem from './ProductSearchItem'
import ProductSearchSkeleton from './ProductSearchSkeleton'

export default function ProductSearch() {
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 400)
  const navigate = useNavigate()

  const enabled = debouncedKeyword.trim().length >= 2

  const { data, isLoading } = useProducts({
    page: 1,
    limit: 5,
    search: debouncedKeyword,
  })

  const products: Product[] = data?.data ?? []
  const isOpen = enabled && keyword.length > 0

  const handleSelect = (product: Product) => {
    setKeyword('')
    navigate(`/product-detail/${product.sku}`)
  }

  const handleSearchAll = () => {
    if (!keyword.trim()) return
    navigate(`/products?search=${encodeURIComponent(keyword)}`)
    setKeyword('')
  }

  return (
    <Popover open={isOpen}>
      <PopoverTrigger asChild>
        <div className="group relative z-50 w-full">
          <Search className="text-muted-foreground absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchAll()}
            placeholder="Bạn tìm gì..."
            className="h-10 w-full rounded-md border bg-white pl-10 shadow-sm focus-visible:ring-1 focus-visible:ring-emerald-600"
          />
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="mt-1 w-[var(--radix-popover-trigger-width)] rounded-md border bg-white p-0 shadow-lg"
        align="start"
        sideOffset={5}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col">
          {isLoading && (
            <div className="p-2">
              <ProductSearchSkeleton />
            </div>
          )}

          {!isLoading && products.length === 0 && (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
              <PackageOpen className="mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">Không tìm thấy sản phẩm</p>
            </div>
          )}

          {!isLoading && products.length > 0 && (
            <ul>
              {products.map((product) => (
                <ProductSearchItem
                  key={product.id}
                  product={product}
                  onSelect={handleSelect}
                />
              ))}

              <li
                onClick={handleSearchAll}
                className="cursor-pointer border-t bg-gray-50 p-2 text-center text-sm text-blue-600 hover:underline"
              >
                Xem tất cả kết quả cho "{keyword}"
              </li>
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
