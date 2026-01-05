import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import FavoriteProductItem from "./FavoriteProductItem";
import {
  useFavoriteProducts,
  useRemoveFavorite,
} from "./favoriteProducts.queries";

export default function FavoriteProducts() {
  const { data, isLoading, error } = useFavoriteProducts();
  const removeMutation = useRemoveFavorite();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [productToRemove, setProductToRemove] = useState<number | null>(null);

  const favoriteProducts = data?.data ?? [];

  const handleAddToCart = (_id: number) => {
    // To do add to cart
  };

  const handleBuyNow = (_id: number) => {
    // To do buy now
  };

  const handleRemove = (id: number) => {
    setProductToRemove(id);
    setConfirmOpen(true);
  };

  const handleConfirmRemove = () => {
    if (productToRemove) {
      removeMutation.mutate(productToRemove);
      setConfirmOpen(false);
      setProductToRemove(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-red-600">
          Có lỗi xảy ra khi tải danh sách yêu thích
        </p>
      </div>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <p className="text-gray-500 text-lg">
          Chưa có sản phẩm yêu thích nào
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="max-h-[70vh] overflow-y-auto">
        <div className="flex flex-col gap-4 p-6">
          {favoriteProducts.map((product) => (
            <FavoriteProductItem
              key={product.id}
              product={product}
              onAddToCart={() => handleAddToCart(product.id)}
              onBuyNow={() => handleBuyNow(product.id)}
              onRemove={() => handleRemove(product.id)}
            />
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmRemove}
        title="Xóa khỏi danh sách yêu thích"
        description="Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách yêu thích?"
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        isLoading={removeMutation.isPending}
      />
    </>
  );
}
