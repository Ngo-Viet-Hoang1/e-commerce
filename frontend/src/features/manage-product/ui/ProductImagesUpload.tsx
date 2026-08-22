import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { ImagePlus, Plus, Star, Trash2 } from 'lucide-react'
import { useEffect } from 'react'

export interface ProductImageForm {
  url: string
  altText: string
  isPrimary: boolean
  file?: File
}

interface ProductImagesUploadProps {
  images: ProductImageForm[]
  onChange: (images: ProductImageForm[]) => void
  inputId?: string
  disabled?: boolean
}

export function ProductImagesUpload({
  images,
  onChange,
  inputId = 'product-images',
  disabled = false,
}: ProductImagesUploadProps) {
  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: ProductImageForm[] = []
    for (const file of files) {
      const url = URL.createObjectURL(file)
      newImages.push({
        url,
        altText: '',
        isPrimary: images.length === 0 && newImages.length === 0,
        file,
      })
    }

    onChange([...images, ...newImages])
  }

  const handleRemove = (index: number) => {
    const next = images.filter((_, i) => i !== index)
    if (!next.some((img) => img.isPrimary) && next.length > 0) {
      next[0].isPrimary = true
    }
    onChange(next)
  }

  const handleAltTextChange = (index: number, altText: string) => {
    onChange(images.map((img, i) => (i === index ? { ...img, altText } : img)))
  }

  const handlePrimaryChange = (index: number) => {
    onChange(
      images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    )
  }

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.file && img.url.startsWith('blob:'))
          URL.revokeObjectURL(img.url)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-3">
      <Input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageAdd}
        className="hidden"
        id={inputId}
        disabled={disabled}
      />

      {images.length === 0 ? (
        /* Empty State: Slim inline dropzone */
        <Label htmlFor={inputId} className="cursor-pointer block">
          <div className="hover:border-primary/80 hover:bg-primary/5 rounded-xl border border-dashed p-4.5 flex items-center justify-center gap-3 text-center transition-all bg-muted/20">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <ImagePlus className="text-primary size-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-foreground">
                Nhấp để tải ảnh lên hoặc kéo thả vào đây
              </p>
              <p className="text-[11px] text-muted-foreground">
                Định dạng PNG, JPG, WEBP • Tối đa 5MB / file
              </p>
            </div>
          </div>
        </Label>
      ) : (
        /* Grid of compact thumbnails + Add tile */
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
          {images.map((img, index) => (
            <div
              key={index}
              className={`group relative rounded-lg border overflow-hidden bg-card transition-all flex flex-col ${
                img.isPrimary
                  ? 'ring-2 ring-primary border-primary shadow-xs'
                  : 'hover:border-primary/40'
              }`}
            >
              <div className="aspect-square relative overflow-hidden bg-muted/15 flex items-center justify-center">
                <img
                  src={img.url}
                  alt={img.altText || 'Ảnh sản phẩm'}
                  className="h-full w-full object-contain p-1.5"
                />

                {/* Primary Badge */}
                {img.isPrimary && (
                  <Badge className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] px-1.5 py-0 h-4 gap-0.5 shadow">
                    <Star className="size-2.5 fill-current" />
                    Chính
                  </Badge>
                )}

                {/* Quick overlay buttons */}
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!img.isPrimary && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="size-6 bg-background/90 backdrop-blur shadow-xs hover:bg-background"
                      onClick={() => handlePrimaryChange(index)}
                      title="Đặt làm ảnh chính"
                      disabled={disabled}
                    >
                      <Star className="size-3 text-amber-500" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="size-6 shadow-xs"
                    onClick={() => handleRemove(index)}
                    title="Xóa ảnh"
                    disabled={disabled}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>

              <div className="p-1 border-t bg-muted/10">
                <Input
                  placeholder="Mô tả alt..."
                  value={img.altText}
                  onChange={(e) => handleAltTextChange(index, e.target.value)}
                  className="h-6 text-[10px] px-1.5 rounded"
                  disabled={disabled}
                />
              </div>
            </div>
          ))}

          {/* Add more button tile */}
          <Label
            htmlFor={inputId}
            className="cursor-pointer aspect-square rounded-lg border border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-1 transition-colors text-muted-foreground hover:text-primary"
          >
            <Plus className="size-5" />
            <span className="text-[11px] font-medium">Thêm ảnh</span>
          </Label>
        </div>
      )}
    </div>
  )
}
