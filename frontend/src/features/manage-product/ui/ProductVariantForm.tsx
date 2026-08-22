import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Badge } from '@/shared/ui/badge'
import { Plus, Trash2, X, Tag } from 'lucide-react'
import { ProductImagesUpload, type ProductImageForm } from './ProductImagesUpload'

export interface VariantFormData {
  id: string | number
  sku: string
  title: string
  price: string
  costPrice: string
  msrp: string
  stockQuantity: string
  isDefault: boolean
  attributes: { attributeName: string; value: string }[]
  images: ProductImageForm[]
  _isNew?: boolean
}

interface ProductVariantFormProps {
  variant: VariantFormData
  variantIndex: number
  canRemove: boolean
  onRemove: () => void
  onUpdate: (updated: Partial<VariantFormData>) => void
  onAddAttribute: (defaultName?: string) => void
  onRemoveAttribute: (index: number) => void
  disabled?: boolean
}

const COMMON_ATTRIBUTES = ['Màu sắc', 'Dung lượng', 'Kích cỡ', 'Chất liệu']

export function ProductVariantForm({
  variant,
  variantIndex,
  canRemove,
  onRemove,
  onUpdate,
  onAddAttribute,
  onRemoveAttribute,
  disabled = false,
}: ProductVariantFormProps) {
  return (
    <div className={`rounded-xl border transition-all p-3.5 space-y-3 bg-card ${
      variant.isDefault ? 'border-primary/60 ring-1 ring-primary/20 shadow-xs' : 'border-border'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <Badge variant={variant.isDefault ? 'default' : 'secondary'} className="px-2 py-0 h-5 text-[11px]">
            Phiên bản #{variantIndex + 1}
          </Badge>
          {variant.title && (
            <span className="font-semibold text-xs text-foreground truncate max-w-[200px]">
              {variant.title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            <Checkbox
              checked={variant.isDefault}
              onCheckedChange={(checked) => onUpdate({ isDefault: !!checked })}
              disabled={disabled}
              className="size-3.5"
            />
            <span>Mặc định</span>
          </label>

          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              disabled={disabled}
              className="text-destructive hover:text-destructive h-6 px-1.5 text-xs hover:bg-destructive/10 cursor-pointer"
              title="Xóa phiên bản này"
            >
              <Trash2 className="size-3 mr-1" />
              Xóa
            </Button>
          )}
        </div>
      </div>

      {/* SKU & Title */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold">
            Mã SKU <span className="text-destructive">*</span>
          </Label>
          <Input
            value={variant.sku}
            onChange={(e) => onUpdate({ sku: e.target.value.toUpperCase() })}
            placeholder="VD: IP15PM-256GB"
            required
            disabled={disabled}
            className="h-8 rounded-md font-mono text-xs uppercase"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] font-semibold">Tên hiển thị phân loại</Label>
          <Input
            value={variant.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="VD: 256GB - Titan Tự Nhiên"
            disabled={disabled}
            className="h-8 rounded-md text-xs"
          />
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold">
            Giá bán (VND) <span className="text-destructive">*</span>
          </Label>
          <Input
            type="number"
            value={variant.price}
            onChange={(e) => onUpdate({ price: e.target.value })}
            placeholder="29990000"
            required
            disabled={disabled}
            className="h-8 rounded-md text-xs font-semibold"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-muted-foreground">Giá vốn (VND)</Label>
          <Input
            type="number"
            value={variant.costPrice}
            onChange={(e) => onUpdate({ costPrice: e.target.value })}
            placeholder="25000000"
            disabled={disabled}
            className="h-8 rounded-md text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-muted-foreground">Giá niêm yết (MSRP)</Label>
          <Input
            type="number"
            value={variant.msrp}
            onChange={(e) => onUpdate({ msrp: e.target.value })}
            placeholder="34990000"
            disabled={disabled}
            className="h-8 rounded-md text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] font-semibold">
            Tồn kho <span className="text-destructive">*</span>
          </Label>
          <Input
            type="number"
            value={variant.stockQuantity}
            onChange={(e) => onUpdate({ stockQuantity: e.target.value })}
            placeholder="100"
            required
            disabled={disabled}
            className="h-8 rounded-md text-xs"
          />
        </div>
      </div>

      {/* Modern Compact Attributes (Chip / Pill Design) */}
      <div className="space-y-2 pt-1 border-t">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Tag className="size-3 text-primary" />
              Thuộc tính:
            </span>
            <div className="flex flex-wrap gap-1">
              {COMMON_ATTRIBUTES.map((attr) => (
                <button
                  key={attr}
                  type="button"
                  onClick={() => onAddAttribute(attr)}
                  className="text-[10px] px-1.5 py-0.5 rounded-md border bg-muted/40 hover:bg-primary/10 hover:border-primary text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  + {attr}
                </button>
              ))}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onAddAttribute()}
            disabled={disabled}
            className="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Plus className="mr-1 size-3" />
            Thuộc tính khác
          </Button>
        </div>

        {/* Compound Tag Chips Container */}
        {variant.attributes.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-muted/20 border border-dashed">
            {variant.attributes.map((attr, attrIndex) => (
              <div
                key={attrIndex}
                className="flex items-center gap-1.5 bg-background border rounded-lg px-2.5 py-1 shadow-2xs hover:border-primary/50 transition-colors"
              >
                <input
                  type="text"
                  placeholder="Tên thuộc tính"
                  value={attr.attributeName}
                  onChange={(e) => {
                    const newAttrs = [...variant.attributes]
                    newAttrs[attrIndex] = { ...attr, attributeName: e.target.value }
                    onUpdate({ attributes: newAttrs })
                  }}
                  className="w-20 font-semibold text-[11px] text-muted-foreground bg-transparent border-0 p-0 focus:outline-none focus:text-primary placeholder:text-muted-foreground/50"
                  disabled={disabled}
                />
                <span className="text-muted-foreground text-xs font-light">:</span>
                <input
                  type="text"
                  placeholder="Giá trị (VD: Đen Titan)"
                  value={attr.value}
                  onChange={(e) => {
                    const newAttrs = [...variant.attributes]
                    newAttrs[attrIndex] = { ...attr, value: e.target.value }
                    onUpdate({ attributes: newAttrs })
                  }}
                  className="w-28 font-medium text-xs text-foreground bg-transparent border-0 p-0 focus:outline-none placeholder:text-muted-foreground/50"
                  disabled={disabled}
                />
                <button
                  type="button"
                  onClick={() => onRemoveAttribute(attrIndex)}
                  disabled={disabled}
                  className="text-muted-foreground hover:text-destructive p-0.5 rounded-full hover:bg-muted transition-colors cursor-pointer"
                  title="Xóa thuộc tính này"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground italic">
            Chưa có thuộc tính (Chọn các nút &ldquo;+ Màu sắc&rdquo;, &ldquo;+ Dung lượng&rdquo; ở trên để thêm nhanh)
          </p>
        )}
      </div>

      {/* Variant Images - Always directly visible & compact */}
      <div className="space-y-1.5 pt-1.5 border-t">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] font-semibold text-muted-foreground">
            Ảnh riêng cho phiên bản này:
          </Label>
          <span className="text-[10px] text-muted-foreground">
            {variant.images.length > 0
              ? `${variant.images.length} ảnh`
              : '(Dùng ảnh chung của sản phẩm nếu để trống)'}
          </span>
        </div>
        <ProductImagesUpload
          images={variant.images}
          onChange={(images) => onUpdate({ images })}
          inputId={`variant-images-${variant.id}`}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
