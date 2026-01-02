import {
  Edit,
  Save,
  Trash2,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useState } from "react"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { RHFCombobox } from "@/components/common/RHFCombobox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import type { Address } from "@/interfaces/location.interface"
import {
  useDeleteAddress,
  useDistricts,
  useUpdateAddress,
} from "./address.queries"

interface Option {
  label: string
  value: string
}

interface Props {
  address: Address
  selected: boolean
  onSelect: () => void
  provinceOptions: Option[]
  isOnlyAddress: boolean
  hasOtherDefault: boolean
}

export default function AddressItem({
  address,
  selected,
  onSelect,
  provinceOptions,
  hasOtherDefault,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [provinceCode, setProvinceCode] = useState(address.province.code)
  const [districtCode, setDistrictCode] = useState(address.district.code)
  const [detail, setDetail] = useState(address.detail)
  const [isDefault, setIsDefault] = useState(address.isDefault)

  const { data: districts = [], isLoading: loadingDistricts } =
    useDistricts(editing ? provinceCode : "")

  const updateAddress = useUpdateAddress()
  const deleteAddress = useDeleteAddress()

  const districtOptions = districts.map((d) => ({
    label: d.name,
    value: d.code,
  }))

  const handleProvinceChange = (code: string) => {
    setProvinceCode(code)
    setDistrictCode("")
  }

  const save = async () => {
    const province = provinceOptions.find((p) => p.value === provinceCode)
    const district = districtOptions.find((d) => d.value === districtCode)
    if (!province || !district) return

    await updateAddress.mutateAsync(
      {
        id: address.id,
        payload: {
          provinceCode: province.value,
          districtCode: district.value,
          detail: detail ?? undefined,
          isDefault,
        },
      },
      {
        onSuccess: () => setEditing(false),
      }
    )
  }

  const saving = updateAddress.isPending

  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors",
        selected && "border-primary"
      )}
      onClick={editing ? undefined : onSelect}
    >
      <CardContent
        className="p-4"
        onClick={(e) => editing && e.stopPropagation()}
      >
        {editing ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Chỉnh sửa địa chỉ</h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditing(false)
                  }}
                  disabled={saving}
                >
                  <X className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    save()
                  }}
                  disabled={saving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Đang lưu..." : "Lưu"}
                </Button>
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  id={`isDefault-${address.id}`}
                  checked={isDefault}
                  onCheckedChange={setIsDefault}
                  disabled={address.isDefault && !hasOtherDefault}
                />
                <Label htmlFor={`isDefault-${address.id}`}>
                  Đặt làm địa chỉ mặc định
                  {address.isDefault && !hasOtherDefault && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Phải có ít nhất một địa chỉ mặc định)
                    </span>
                  )}
                </Label>
              </div>

              <div className="flex gap-4">
                <RHFCombobox
                  options={provinceOptions}
                  value={provinceCode}
                  onChange={handleProvinceChange}
                  placeholder="Chọn tỉnh/thành phố..."
                />

                <RHFCombobox
                  options={districtOptions}
                  value={districtCode}
                  onChange={setDistrictCode}
                  disabled={!provinceCode || loadingDistricts}
                  placeholder={
                    loadingDistricts
                      ? "Đang tải..."
                      : !provinceCode
                        ? "Chọn tỉnh/thành phố trước"
                        : "Chọn quận/huyện..."
                  }
                />

                <Input
                  placeholder="Số đường / số nhà..."
                  value={detail ?? ""}
                  onChange={(e) => setDetail(e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {address.province.name}
                  </span>
                  {address.isDefault && (
                    <Badge variant="secondary">Mặc định</Badge>
                  )}
                </div>

                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditing(true)
                    }}
                    disabled={saving}
                    title="Chỉnh sửa"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowDeleteDialog(true)
                    }}
                    disabled={saving || address.isDefault}
                    title={
                      address.isDefault
                        ? "Không thể xóa địa chỉ mặc định"
                        : "Xóa địa chỉ"
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-2 text-sm text-muted-foreground">
                <p>{address.detail}</p>
                <p>
                  {address.district.name}, {address.province.name}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Xác nhận xóa địa chỉ"
        description="Bạn có chắc chắn muốn xóa địa chỉ này không?"
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        onConfirm={() => {
          deleteAddress.mutate(address.id, {
            onSuccess: () => setShowDeleteDialog(false),
          })
        }}
      />
    </Card>
  )
}
