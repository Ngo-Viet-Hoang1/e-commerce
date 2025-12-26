import { RHFCombobox } from '@/components/common/RHFCombobox'
import TiptapEditor from '@/components/common/TiptapEditor'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Brand } from '@/interfaces/brand.interface'
import type { Category } from '@/interfaces/category.interface'

interface ProductBasicInfoProps {
  formData: {
    name: string
    sku: string
    description: string
    status: 'active' | 'inactive' | 'draft' | 'out_of_stock'
    brandId: string
    categoryId: string
    isFeatured?: boolean
  }
  brands?: Brand[]
  categories?: Category[]
  onChange: (data: Partial<ProductBasicInfoProps['formData']>) => void
  disabled?: boolean
}

export function ProductBasicInfo({
  formData,
  brands,
  categories,
  onChange,
  disabled = false,
}: ProductBasicInfoProps) {
  return (
    <div className="space-y-4">
      <div className="bg-muted/30 flex items-center space-x-2 rounded-lg border p-3">
        <Checkbox
          id="isFeatured"
          checked={formData.isFeatured ?? false}
          onCheckedChange={(checked) => onChange({ isFeatured: !!checked })}
          disabled={disabled}
        />
        <Label htmlFor="isFeatured" className="cursor-pointer">
          Mark as Featured Product
        </Label>
        <span className="text-muted-foreground text-xs">
          {' '}
          (Highlight this product on homepage or promotions)
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Product Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="iPhone 15 Pro"
            required
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">
            Product SKU <span className="text-destructive">*</span>
          </Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => onChange({ sku: e.target.value })}
            placeholder="IPHONE-15-PRO"
            required
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">
            Brand <span className="text-destructive">*</span>
          </Label>

          <RHFCombobox
            value={formData.brandId}
            onChange={(value) => onChange({ brandId: value })}
            options={
              brands?.map((brand) => ({
                label: brand.name,
                value: brand.id.toString(),
              })) ?? []
            }
            placeholder="Select brand"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">
            Category <span className="text-destructive">*</span>
          </Label>
          <RHFCombobox
            value={formData.categoryId}
            onChange={(value) => onChange({ categoryId: value })}
            options={
              categories?.map((category) => ({
                label: category.name,
                value: category.id.toString(),
              })) ?? []
            }
            placeholder="Select category"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>

          <RHFCombobox
            value={formData.status}
            onChange={(value) =>
              onChange({
                status: value as
                  | 'active'
                  | 'inactive'
                  | 'draft'
                  | 'out_of_stock',
              })
            }
            options={[
              { label: 'Draft – Not visible', value: 'draft' },
              { label: 'Active – Available for sale', value: 'active' },
              { label: 'Inactive – Hidden', value: 'inactive' },
              { label: 'Out of Stock – Sold out', value: 'out_of_stock' },
            ]}
            placeholder="Select status"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <TiptapEditor
          value={formData.description}
          onChange={(html) => onChange({ description: html })}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
