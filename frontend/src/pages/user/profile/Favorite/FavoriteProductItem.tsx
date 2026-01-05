import { Button } from "@/components/ui/button";
import type { Product } from "@/interfaces/product.interface";
import { formatCurrency } from "@/lib/format";
import { ShoppingCart, Trash, Truck } from "lucide-react";
import { useState } from "react";

const DEFAULT_IMAGE_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe3voLMssoFCjgCJvU-0063NQqO9E2UCb-Ig&s";

export interface FavoriteProductItemProps {
  product: Product;
  currency?: string;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  onRemove?: () => void;
}

export default function FavoriteProductItem({
  product,
  currency = "VND",
  onAddToCart,
  onBuyNow,
  onRemove,
}: FavoriteProductItemProps) {
  const [imgError, setImgError] = useState(false);

  const imageUrl =
    product.productImages?.[0]?.url ??
    product.variants?.[0]?.productImages?.[0]?.url ??
    DEFAULT_IMAGE_URL;
  const productName = product.name;

  const displayImageUrl = imgError ? DEFAULT_IMAGE_URL : imageUrl;

  const displayPrice =
    product.minPrice ?? product.variants?.[0]?.price;

  return (
    <div className="group relative flex w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-2 text-gray-600 backdrop-blur-sm transition-colors hover:bg-red-50 hover:text-red-600 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-red-900/30 dark:hover:text-red-400"
          aria-label="Remove from favorites"
        >
          <Trash className="h-5 w-5" />
        </button>
      )}

      <div className="relative w-[200px] flex-shrink-0 overflow-hidden p-4">
        <div className="flex h-full items-center justify-center transition-transform duration-500 group-hover:scale-105">
          <img
            src={displayImageUrl}
            alt={productName}
            className="h-[140px] w-full rounded-lg object-contain"
            onError={() => setImgError(true)}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            {productName}
          </h3>
          {product.shortDescription && (
            <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
              {product.shortDescription}
            </p>
          )}
        </div>

        <div className="mt-auto space-y-2">
          <div className="space-y-1">
            {displayPrice ? (
              <div className="text-xl font-semibold leading-none">
                {formatCurrency(displayPrice, currency)}
              </div>
            ) : (
              <span className="text-sm text-gray-500">Liên hệ</span>
            )}
            <p className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
              <Truck size={16} />
              Free delivery
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onAddToCart} className="flex-1" size="sm">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Thêm vào giỏ
            </Button>
            <Button className="flex-1 text-white" onClick={onBuyNow} size="sm">
              Mua ngay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
