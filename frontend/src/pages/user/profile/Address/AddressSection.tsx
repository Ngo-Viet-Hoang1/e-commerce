import { MapPin, Plus, Save, X } from "lucide-react"

import React, { useState } from "react"

import { RHFCombobox } from "@/components/common/RHFCombobox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import AddressItem from "./AddressItem"

import { useAuthStore } from "@/store/zustand/useAuthStore"
import {
  useAddresses,
  useCreateAddress,
  useDistricts,
  useProvinces,
} from "./address.queries"

export default function AddressSection() {
  const { me } = useAuthStore()

  const [selectedAddressId, setSelectedAddressId] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const [provinceCode, setProvinceCode] = useState("")
  const [districtCode, setDistrictCode] = useState("")
  const [detail, setDetail] = useState("")
  const [isDefaultNew, setIsDefaultNew] = useState(false)

  const { data: addresses = [], isLoading: loading } = useAddresses(!!me?.id)
  const { data: provinces = [], isLoading: loadingProvinces } = useProvinces()
  const { data: districts = [], isLoading: loadingDistricts } = useDistricts(provinceCode)

  const createAddress = useCreateAddress()

  React.useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault)
      setSelectedAddressId(defaultAddr?.id.toString() ?? addresses[0]?.id.toString() ?? "")
    }
  }, [addresses, selectedAddressId])

  const handleProvinceChange = (code: string) => {
    setProvinceCode(code)
    setDistrictCode("")
  }

  const cancelAdd = () => {
    setIsAdding(false)
    setProvinceCode("")
    setDistrictCode("")
    setDetail("")
    setIsDefaultNew(false)
  }

  const saveNew = async () => {
    const province = provinces.find((p) => p.code === provinceCode)
    const district = districts.find((d) => d.code === districtCode)

    if (!province || !district || !detail.trim()) return

    await createAddress.mutateAsync(
      {
        provinceCode: province.code,
        districtCode: district.code,
        detail: detail.trim(),
        isDefault: isDefaultNew || addresses.length === 0,
      },
      {
        onSuccess: () => cancelAdd(),
      }
    )
  }

  const provinceOptions = provinces.map((p) => ({
    label: p.name,
    value: p.code,
  }))

  const districtOptions = districts.map((d) => ({
    label: d.name,
    value: d.code,
  }))

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
                      <Button size="sm" variant="ghost" onClick={cancelAdd}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={saveNew}
                        disabled={createAddress.isPending}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {createAddress.isPending ? "Đang lưu..." : "Lưu"}
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
                      onChange={handleProvinceChange}
                      placeholder={
                        loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"
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

            <div className="max-h-[350px] space-y-4 overflow-y-auto pr-2">
              {addresses.map((address) => (
                <AddressItem
                  key={address.id}
                  address={address}
                  selected={selectedAddressId === address.id.toString()}
                  onSelect={() => setSelectedAddressId(address.id.toString())}
                  provinceOptions={provinceOptions}
                  isOnlyAddress={addresses.length === 1}
                  hasOtherDefault={addresses.some((a) => a.isDefault && a.id !== address.id)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
