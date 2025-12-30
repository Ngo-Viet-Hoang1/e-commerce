import {
  MoreVertical,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

import LocationService from "@/api/services/user/location.service"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { RHFCombobox } from "@/components/common/RHFCombobox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Address } from "@/interfaces/address.interface"
import type { District } from "@/interfaces/district.interface"

interface Option {
  label: string
  value: string
}

interface Props {
  address: Address
  selected: boolean
  onSelect: () => void
  onUpdate: (address: Address) => Promise<void>
  onDelete: () => Promise<void>

  provinceOptions: Option[]
}

export default function AddressItem({
  address,
  selected,
  onSelect,
  onUpdate,
  onDelete,
  provinceOptions,
}: Props) {
  const [editing, setEditing] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)

  const [provinceCode, setProvinceCode] = React.useState(address.province.code)
  const [districtCode, setDistrictCode] = React.useState(address.district.code)
  const [detail, setDetail] = React.useState(address.detail)
  const [isDefault, setIsDefault] = React.useState(address.isDefault)

  const [districts, setDistricts] = React.useState<District[]>([])
  const [loadingDistricts, setLoadingDistricts] = React.useState(false)

  React.useEffect(() => {
    if (!editing || !provinceCode) {
      setDistricts([])
      return
    }

    setLoadingDistricts(true)
    LocationService.getDistrictsByProvinceCode(provinceCode)
      .then((res) => setDistricts(res.data ?? []))
      .finally(() => setLoadingDistricts(false))
  }, [provinceCode, editing])

  const districtOptions = districts.map((d) => ({
    label: d.name,
    value: d.code,
  }))

  const save = async () => {
    const province = provinceOptions.find((p) => p.value === provinceCode)
    const district = districtOptions.find((d) => d.value === districtCode)
    if (!province || !district) return

    try {
      setSaving(true)
      await onUpdate({
        ...address,
        detail,
        isDefault,
        provinceCode: province.value,
        districtCode: district.value,
        province: { code: province.value, name: province.label },
        district: { code: district.value, name: district.label },
      })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card
      className={cn("cursor-pointer", selected && "border-primary")}
      onClick={editing ? undefined : onSelect}
    >
      <CardContent className="p-4" onClick={(e) => editing && e.stopPropagation()}>
        {editing ? (
          <div className="space-y-4">
            <div className="flex justify-between">
              <h3 className="font-semibold">Edit Address</h3>
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
                  <X className="size-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    save()
                  }}
                  disabled={saving}
                >
                  <Save className="mr-2 size-4" />
                  {saving ? 'Đang lưu...' : 'Save'}
                </Button>
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={isDefault}
                  onCheckedChange={setIsDefault}
                />
                <Label htmlFor="isDefault">Đặt làm địa chỉ mặc định</Label>
              </div>

              <div className="flex gap-4">
                <RHFCombobox
                  options={provinceOptions}
                  value={provinceCode}
                  onChange={(v) => {
                    setProvinceCode(v)
                    setDistrictCode("")
                  }}
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
                  value={detail ?? ''}
                  onChange={(e) => setDetail(e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {address.province.name}
                  </span>
                  {address.isDefault && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditing(true)
                      }}
                      disabled={saving}
                    >
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowDeleteDialog(true)
                      }}
                      disabled={saving}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
        onConfirm={async () => {
          await onDelete()
          setShowDeleteDialog(false)
        }}
      />
    </Card>
  )
}
