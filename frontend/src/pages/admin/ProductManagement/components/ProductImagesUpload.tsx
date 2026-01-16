import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Trash2, Upload } from 'lucide-react'
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

  const handlePrimaryChange = (index: number, isPrimary: boolean) => {
    onChange(
      images.map((img, i) => ({
        ...img,
        isPrimary: i === index ? isPrimary : false,
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
    <div className="space-y-4">
      <div>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageAdd}
          className="hidden"
          id={inputId}
          disabled={disabled}
        />
        <Label htmlFor={inputId}>
          <div className="hover:border-primary cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors">
            <Upload className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              Click to upload product images
            </p>
          </div>
        </Label>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4 xl:grid-cols-4">
          {images.map((img, index) => (
            <div key={index} className="group relative">
              <div className="aspect-square overflow-hidden rounded border">
                <img
                  src={img.url}
                  alt={img.altText || 'Product'}
                  className="h-full w-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="bg-muted/50 absolute top-2 right-2 h-6 w-6"
                onClick={() => handleRemove(index)}
                disabled={disabled}
              >
                <Trash2 className="text-destructive h-4 w-4" />
              </Button>
              <div className="bg-muted/50 hover:bg-background absolute top-2 left-2 flex w-fit cursor-pointer items-center space-x-2 rounded-md border p-1 shadow-sm backdrop-blur transition hover:shadow">
                <Checkbox
                  checked={img.isPrimary}
                  onCheckedChange={(checked) =>
                    handlePrimaryChange(index, !!checked)
                  }
                  disabled={disabled}
                />
                <Label className="text-xs">Primary</Label>
              </div>
              <div className="mt-2 space-y-1">
                <Input
                  placeholder="Alt text"
                  value={img.altText}
                  onChange={(e) => handleAltTextChange(index, e.target.value)}
                  className={cn('text-xs', img.isPrimary && 'border-primary')}
                  disabled={disabled}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
