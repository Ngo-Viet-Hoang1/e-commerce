import TiptapEditor from '@/shared/ui/TiptapEditor'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

interface ProductBasicInfoProps {
  formData: {
    name: string
    sku: string
    description: string
  }
  onChange: (data: Partial<ProductBasicInfoProps['formData']>) => void
  disabled?: boolean
}

export function ProductBasicInfo({
  formData,
  onChange,
  disabled = false,
}: ProductBasicInfoProps) {
  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="name" className="text-xs font-semibold">
            Tên sản phẩm <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Ví dụ: iPhone 15 Pro Max 256GB"
            required
            disabled={disabled}
            className="h-8.5 rounded-lg text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="sku" className="text-xs font-semibold">
            Mã sản phẩm (SKU) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => onChange({ sku: e.target.value.toUpperCase() })}
            placeholder="Ví dụ: IP15PM-256-NATURAL"
            required
            disabled={disabled}
            className="h-8.5 rounded-lg font-mono text-xs uppercase"
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="description" className="text-xs font-semibold">
            Mô tả chi tiết sản phẩm
          </Label>
          <span className="text-[11px] text-muted-foreground">Tự động co dãn theo nội dung</span>
        </div>
        <TiptapEditor
          value={formData.description}
          onChange={(html) => onChange({ description: html })}
          disabled={disabled}
          minHeight="min-h-[100px]"
          maxHeight="max-h-[260px]"
        />
      </div>
    </div>
  )
}
