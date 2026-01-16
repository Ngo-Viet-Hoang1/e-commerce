import { Star } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import type { Product } from '@/interfaces/product.interface'
import DescriptionView from '@/components/common/DescriptionView'

interface ProductTabsProps {
  product: Product
}

export function ProductTabs({ product }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="description">Mô tả</TabsTrigger>
        <TabsTrigger value="specs">Thông số</TabsTrigger>
        <TabsTrigger value="reviews">Đánh giá (48)</TabsTrigger>
      </TabsList>

      {/* Description Tab */}
      <TabsContent value="description" className="mt-6">
        {product.description ? (
          <DescriptionView content={product.description} />
        ) : (
          <p className="text-muted-foreground">Chưa có mô tả chi tiết</p>
        )}
      </TabsContent>

      {/* Specs Tab */}
      <TabsContent value="specs" className="mt-6">
        <div className="space-y-3">
          <div className="flex justify-between border-b py-2">
            <span className="font-medium">SKU</span>
            <span className="text-muted-foreground">{product.sku}</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span className="font-medium">Thương hiệu</span>
            <span className="text-muted-foreground">{product.brand?.name}</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span className="font-medium">Danh mục</span>
            <span className="text-muted-foreground">
              {product.category?.name}
            </span>
          </div>
          {product.weightGrams && (
            <div className="flex justify-between border-b py-2">
              <span className="font-medium">Trọng lượng</span>
              <span className="text-muted-foreground">
                {product.weightGrams}g
              </span>
            </div>
          )}
          <div className="flex justify-between border-b py-2">
            <span className="font-medium">Trạng thái</span>
            <span className="text-muted-foreground">
              {product.status === 'active'
                ? 'Đang bán'
                : product.status === 'out_of_stock'
                  ? 'Hết hàng'
                  : product.status === 'draft'
                    ? 'Nháp'
                    : 'Ngừng bán'}
            </span>
          </div>
        </div>
      </TabsContent>

      {/* Reviews Tab */}
      <TabsContent value="reviews" className="mt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold">4.8</div>
              <div className="mt-1 flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <div className="text-muted-foreground mt-1 text-sm">
                48 đánh giá
              </div>
            </div>
          </div>
          <Separator />
          <p className="text-muted-foreground">
            Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
          </p>
        </div>
      </TabsContent>
    </Tabs>
  )
}
