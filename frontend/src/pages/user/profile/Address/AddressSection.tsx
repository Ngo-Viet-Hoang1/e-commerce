import { MapPin, Plus, Save, X } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { RHFCombobox } from "@/components/common/RHFCombobox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import AddressItem from "./AddressItem"

import type { Address } from "@/interfaces/address.interface"
import type { District } from "@/interfaces/district.interface"
import type { Province } from "@/interfaces/province.interface"

import AddressService from "@/api/services/user/address.service"
import LocationService from "@/api/services/user/location.service"
import { useAuthStore } from "@/store/zustand/useAuthStore"

export default function AddressSection() {
  const { me } = useAuthStore()

  const [addresses, setAddresses] = React.useState<Address[]>([])
  const [selectedId, setSelectedId] = React.useState("")
  const [isAdding, setIsAdding] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const [provinceCode, setProvinceCode] = React.useState("")
  const [districtCode, setDistrictCode] = React.useState("")
  const [detail, setDetail] = React.useState("")
  const [isDefaultNew, setIsDefaultNew] = React.useState(false)

  const [provinces, setProvinces] = React.useState<Province[]>([])
  const [districts, setDistricts] = React.useState<District[]>([])
  const [loadingProvinces, setLoadingProvinces] = React.useState(false)
  const [loadingDistricts, setLoadingDistricts] = React.useState(false)

  const fetchAddresses = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await AddressService.getAll()
      if (res.success && res.data) {
        setAddresses(res.data)

        const defaultAddr = res.data.find((a) => a.isDefault)
        setSelectedId(
          defaultAddr?.id.toString() ?? res.data[0]?.id.toString() ?? ""
        )
      }
    } catch {
      toast.error("Đang tải địa chỉ thất bại")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (me?.id) fetchAddresses()
  }, [me?.id, fetchAddresses])

  React.useEffect(() => {
    setLoadingProvinces(true)
    LocationService.getProvinces()
      .then((res) => setProvinces(res.data ?? []))
      .finally(() => setLoadingProvinces(false))
  }, [])

  React.useEffect(() => {
    if (!provinceCode) {
      setDistricts([])
      setDistrictCode("")
      return
    }

    setLoadingDistricts(true)
    LocationService.getDistrictsByProvinceCode(provinceCode)
      .then((res) => setDistricts(res.data ?? []))
      .finally(() => setLoadingDistricts(false))
  }, [provinceCode])

  const provinceOptions = provinces.map((p) => ({
    label: p.name,
    value: p.code,
  }))

  const districtOptions = districts.map((d) => ({
    label: d.name,
    value: d.code,
  }))

  const saveAddress = async (payload: {
    id?: number
    provinceCode: string
    districtCode: string
    detail?: string
    isDefault: boolean
  }) => {
    try {
      const res = payload.id
        ? await AddressService.update(payload.id, payload)
        : await AddressService.create(payload)

      if (!res.success) return

      toast.success(
        payload.id
          ? "Cập nhật địa chỉ thành công"
          : "Thêm địa chỉ thành công"
      )

      await fetchAddresses()

      if (!payload.id) cancelAdd()
    } catch {
      toast.error(
        payload.id
          ? "Cập nhật địa chỉ thất bại"
          : "Thêm địa chỉ thất bại"
      )
    }
  }

  const cancelAdd = () => {
    setIsAdding(false)
    setProvinceCode("")
    setDistrictCode("")
    setDetail("")
    setIsDefaultNew(false)
  }

  const saveNew = () => {
    const province = provinces.find((p) => p.code === provinceCode)
    const district = districts.find((d) => d.code === districtCode)

    if (!province || !district || !detail.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    saveAddress({
      provinceCode: province.code,
      districtCode: district.code,
      detail: detail.trim(),
      isDefault: isDefaultNew || addresses.length === 0,
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Địa chỉ giao hàng
        </CardTitle>

        <Button size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Đang tải địa chỉ...
          </div>
        ) : (
          <div className="space-y-4">

            {isAdding && (
              <Card className="border-primary">
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Thêm địa chỉ mới</h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelAdd}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={saveNew}>
                        <Save className="mr-2 h-4 w-4" />
                        Lưu
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isDefaultNew}
                      onCheckedChange={setIsDefaultNew}
                    />
                    <Label>Đặt làm địa chỉ mặc định</Label>
                  </div>

                  <div className="flex gap-4">
                    <RHFCombobox
                      options={provinceOptions}
                      value={provinceCode}
                      onChange={(v) => {
                        setProvinceCode(v)
                        setDistrictCode("")
                      }}
                      placeholder={
                        loadingProvinces
                          ? "Đang tải..."
                          : "Chọn tỉnh/thành phố"
                      }
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
                            ? "Chọn tỉnh trước"
                            : "Chọn quận/huyện"
                      }
                    />

                    <Input
                      placeholder="Số nhà / đường"
                      value={detail}
                      onChange={(e) => setDetail(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="max-h-[calc(2.5_*_140px)] overflow-y-auto space-y-4 pr-2">
              {addresses.map((address) => (
                <AddressItem
                  key={address.id}
                  address={address}
                  selected={selectedId === address.id.toString()}
                  onSelect={() =>
                    setSelectedId(address.id.toString())
                  }
                  onUpdate={(updated) =>
                    saveAddress({
                      id: updated.id,
                      provinceCode: updated.province.code,
                      districtCode: updated.district.code,
                      detail: updated.detail ?? undefined,
                      isDefault: updated.isDefault,
                    })
                  }
                  onDelete={async () => {
                    try {
                      await AddressService.delete(address.id)
                      toast.success("Xóa địa chỉ thành công")
                      await fetchAddresses()
                    } catch {
                      toast.error("Xóa địa chỉ thất bại")
                    }
                  }}
                  provinceOptions={provinceOptions}
                />
              ))}
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  )
}
