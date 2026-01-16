import DescriptionView from '@/components/common/DescriptionView'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type { Product } from '@/interfaces/product.interface'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { Pencil, Star } from 'lucide-react'

interface ViewProductDialogProps {
  open: boolean
  product: Product
  onClose: () => void
  onEdit: () => void
}

export function ViewProductDialog({
  open,
  product,
  onClose,
  onEdit,
}: ViewProductDialogProps) {
  const statusColors: Record<string, string> = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    draft: 'bg-yellow-500',
    out_of_stock: 'bg-red-500',
  }

  const totalStock =
    product.variants?.reduce((sum, v) => sum + v.stockQuantity, 0) ?? 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto p-0">
        <DialogHeader className="bg-muted/30 px-6 py-4">
          <DialogTitle className="flex items-center justify-between">
            <span className="text-lg font-semibold tracking-tight">
              Product Details
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-10 px-6 pb-6">
          <section className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl leading-tight font-semibold">
                    {product.name}
                  </h2>
                  {product.isFeatured && (
                    <Star
                      size={18}
                      className="text-yellow-500"
                      fill="currentColor"
                    />
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  SKU: {product.sku}
                </p>
              </div>

              <Badge
                className={`h-fit border-none px-3 py-1 text-xs font-medium text-white ${
                  statusColors[product.status.toLowerCase()] ??
                  statusColors.draft
                }`}
              >
                {product.status}
              </Badge>
            </div>

            <div className="bg-muted/30 rounded-xl border p-4">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <InfoItem label="Brand" value={product.brand?.name ?? '-'} />
                <InfoItem
                  label="Category"
                  value={product.category?.name ?? '-'}
                />
                <InfoItem label="Total Stock" value={totalStock} />
                <InfoItem
                  label="Created At"
                  value={formatDateTime(product.createdAt)}
                />
              </div>
            </div>

            {product.description && (
              <div className="bg-background rounded-lg border p-4">
                <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">
                  Description
                </p>
                <DescriptionView content={product.description} />
              </div>
            )}
          </section>

          <Separator />

          {product.productImages && product.productImages?.length > 0 && (
            <section className="space-y-3">
              <h4 className="font-semibold">Product Images</h4>
              <div className="grid grid-cols-4 gap-4">
                {product?.productImages?.map((img) => (
                  <div
                    key={img.imageId}
                    className="group bg-muted relative aspect-square overflow-hidden rounded-xl border"
                  >
                    <img
                      src={img.url}
                      alt={img.altText ?? product.name}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    {img.isPrimary && (
                      <Badge className="absolute top-2 left-2 bg-black/70 text-xs text-white">
                        Primary
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <Separator />

          <section className="space-y-4">
            <h4 className="font-semibold">
              Variants ({product.variants?.length ?? 0})
            </h4>

            <div className="space-y-4">
              {product.variants?.map((variant) => (
                <div
                  key={variant.id}
                  className="bg-muted/30 hover:bg-muted/50 rounded-lg border p-4 transition"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {variant.title ?? variant.sku}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {variant.sku}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge variant="outline">
                          Stock: {variant.stockQuantity}
                        </Badge>
                        {variant.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-sm">
                      <p className="font-semibold">
                        {formatCurrency(variant.price)}
                      </p>

                      {variant.msrp && (
                        <p className="text-muted-foreground text-xs line-through">
                          MSRP: {formatCurrency(variant.msrp)}
                        </p>
                      )}

                      {variant.costPrice && (
                        <p className="text-muted-foreground text-xs">
                          Cost: {formatCurrency(variant.costPrice)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Attributes */}
                  {variant?.attributeValues &&
                    variant.attributeValues?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {variant.attributeValues.map((attrVal) => (
                          <Badge
                            key={attrVal.id}
                            variant="outline"
                            className="text-xs"
                          >
                            {attrVal.attribute?.name}: {attrVal.valueText}
                          </Badge>
                        ))}
                      </div>
                    )}

                  {/* Variant Images */}
                  {variant?.productImages &&
                    variant.productImages?.length > 0 && (
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {variant.productImages.map((img) => (
                          <div
                            key={img.imageId}
                            className="group aspect-square overflow-hidden rounded-md border"
                          >
                            <img
                              src={img.url}
                              alt={img.altText ?? variant.title ?? ''}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <DialogFooter className="bg-background sticky bottom-0 p-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs uppercase">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}
