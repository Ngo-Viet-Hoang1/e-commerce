import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, X } from 'lucide-react'
import { ProductImagesUpload } from './ProductImagesUpload'

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
  images: { url: string; altText: string; isPrimary: boolean; file?: File }[]
  _isNew?: boolean
}

interface ProductVariantFormProps {
  variant: VariantFormData
  variantIndex: number
  canRemove: boolean
  onRemove: () => void
  onUpdate: (updated: Partial<VariantFormData>) => void
  onAddAttribute: () => void
  onRemoveAttribute: (index: number) => void
  disabled?: boolean
}

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
    <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Variant #{variantIndex + 1}</h4>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={disabled}
          >
            <Trash2 className="text-destructive h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="bg-muted/30 flex items-center space-x-2 rounded-lg border p-3">
        <Checkbox
          id="isDefault"
          checked={variant.isDefault}
          onCheckedChange={(checked) => onUpdate({ isDefault: !!checked })}
          disabled={disabled}
        />
        <Label htmlFor="isDefault" className="cursor-pointer">
          Set as Default Variant
        </Label>
        <span className="text-muted-foreground text-xs">
          {' '}
          (Highlight this product on homepage or promotions)
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Variant SKU <span className="text-destructive">*</span>
          </Label>
          <Input
            value={variant.sku}
            onChange={(e) => onUpdate({ sku: e.target.value })}
            placeholder="IPHONE-15-128GB-BLACK"
            required
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={variant.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="128GB - Black"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>
            Price <span className="text-destructive">*</span>
          </Label>
          <Input
            type="number"
            value={variant.price}
            onChange={(e) => onUpdate({ price: e.target.value })}
            placeholder="28990000"
            required
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label>Cost Price</Label>
          <Input
            type="number"
            value={variant.costPrice}
            onChange={(e) => onUpdate({ costPrice: e.target.value })}
            placeholder="25000000"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label>MSRP</Label>
          <Input
            type="number"
            value={variant.msrp}
            onChange={(e) => onUpdate({ msrp: e.target.value })}
            placeholder="32000000"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label>Stock Quantity</Label>
          <Input
            type="number"
            value={variant.stockQuantity}
            onChange={(e) => onUpdate({ stockQuantity: e.target.value })}
            placeholder="50"
            disabled={disabled}
          />
        </div>
      </div>

      <Separator />

      {/* Attributes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Attributes (Color, Size, RAM, etc.)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddAttribute}
            disabled={disabled}
          >
            <Plus className="mr-1 h-3 w-3" />
            Add Attribute
          </Button>
        </div>

        {variant.attributes.map((attr, attrIndex) => (
          <div key={attrIndex} className="flex gap-2">
            <Input
              placeholder="Attribute Name (e.g., Color)"
              value={attr.attributeName}
              onChange={(e) => {
                const newAttrs = [...variant.attributes]
                newAttrs[attrIndex] = { ...attr, attributeName: e.target.value }
                onUpdate({ attributes: newAttrs })
              }}
              disabled={disabled}
            />
            <Input
              placeholder="Value (e.g., Black)"
              value={attr.value}
              onChange={(e) => {
                const newAttrs = [...variant.attributes]
                newAttrs[attrIndex] = { ...attr, value: e.target.value }
                onUpdate({ attributes: newAttrs })
              }}
              disabled={disabled}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemoveAttribute(attrIndex)}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Separator />

        <div className="space-y-2">
          <Label>Variant Images</Label>

          <ProductImagesUpload
            images={variant.images}
            onChange={(images) => onUpdate({ images })}
            inputId={`variant-images-${variant.id}`}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}
