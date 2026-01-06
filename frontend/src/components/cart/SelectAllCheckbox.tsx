import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

interface SelectAllCheckboxProps {
  totalCount: number
  selectedCount: number
  isAllSelected: boolean
  onSelectAll: (checked: boolean) => void
}

export function SelectAllCheckbox({
  totalCount,
  selectedCount,
  isAllSelected,
  onSelectAll,
}: SelectAllCheckboxProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex items-center gap-3 py-4">
        <Checkbox
          id="select-all"
          checked={isAllSelected}
          onCheckedChange={onSelectAll}
        />
        <label
          htmlFor="select-all"
          className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Chọn tất cả ({totalCount} sản phẩm)
        </label>
        {selectedCount > 0 && (
          <span className="text-muted-foreground ml-auto text-sm">
            Đã chọn {selectedCount} sản phẩm
          </span>
        )}
      </CardContent>
    </Card>
  )
}
