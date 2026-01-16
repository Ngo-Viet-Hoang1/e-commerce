import { Plus, Save, X } from 'lucide-react'
import { useState } from 'react'

import { RHFCombobox } from '@/components/common/RHFCombobox'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

import type { Address } from '@/interfaces/location.interface'
import {
  useAddresses,
  useCreateAddress,
  useDistricts,
  useProvinces,
} from '@/pages/user/profile/Address/address.queries'
import AddressItem from '@/pages/user/profile/Address/AddressItem'
import { useAuthStore } from '@/store/zustand/useAuthStore'

interface AddressSelectorProps {
  selectedAddressId: string
  onAddressSelect: (addressId: string, address: Address) => void
}

export default function AddressSelector({
  selectedAddressId,
  onAddressSelect,
}: AddressSelectorProps) {
  const { me } = useAuthStore()

  const [isAdding, setIsAdding] = useState(false)
  const [provinceCode, setProvinceCode] = useState('')
  const [districtCode, setDistrictCode] = useState('')
  const [detail, setDetail] = useState('')
  const [isDefaultNew, setIsDefaultNew] = useState(false)

  const { data: addresses = [], isLoading: loading } = useAddresses(!!me?.id)
  const { data: provinces = [], isLoading: loadingProvinces } = useProvinces()
  const { data: districts = [], isLoading: loadingDistricts } =
    useDistricts(provinceCode)

  const createAddress = useCreateAddress()

  const handleProvinceChange = (code: string) => {
    setProvinceCode(code)
    setDistrictCode('')
  }

  const cancelAdd = () => {
    setIsAdding(false)
    setProvinceCode('')
    setDistrictCode('')
    setDetail('')
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
        onSuccess: () => {
          cancelAdd()
          // Auto-select the newly created address if it's the first one or default
          // The query will invalidate and refetch, updating the addresses list
        },
      },
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

  const handleAddressClick = (address: Address) => {
    onAddressSelect(address.id.toString(), address)
  }

  if (loading) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        Đang tải địa chỉ...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Add New Address Form */}
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
                  {createAddress.isPending ? 'Đang lưu...' : 'Lưu'}
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
                  loadingProvinces ? 'Đang tải...' : 'Chọn tỉnh/thành phố'
                }
              />

              <RHFCombobox
                options={districtOptions}
                value={districtCode}
                onChange={setDistrictCode}
                disabled={!provinceCode || loadingDistricts}
                placeholder={
                  loadingDistricts
                    ? 'Đang tải...'
                    : !provinceCode
                      ? 'Chọn tỉnh trước'
                      : 'Chọn quận/huyện'
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

      {/* Add Address Button */}
      {!isAdding && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm địa chỉ mới
        </Button>
      )}

      {/* Address List */}
      {addresses.length > 0 ? (
        <div className="max-h-[400px] space-y-4 overflow-y-auto pr-2">
          {addresses.map((address) => (
            <AddressItem
              key={address.id}
              address={address}
              selected={selectedAddressId === address.id.toString()}
              onSelect={() => handleAddressClick(address)}
              provinceOptions={provinceOptions}
              isOnlyAddress={addresses.length === 1}
              hasOtherDefault={addresses.some(
                (a) => a.isDefault && a.id !== address.id,
              )}
            />
          ))}
        </div>
      ) : (
        !isAdding && (
          <div className="text-muted-foreground py-8 text-center">
            <p className="mb-4">Bạn chưa có địa chỉ nào</p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm địa chỉ đầu tiên
            </Button>
          </div>
        )
      )}
    </div>
  )
}
