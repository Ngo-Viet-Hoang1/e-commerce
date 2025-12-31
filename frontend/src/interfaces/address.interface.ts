export interface Address {
  id: number
  userId: number
  districtCode: string
  provinceCode: string
  detail: string | null
  isDefault: boolean

  createdAt: Date
  updatedAt: Date

  district: {
    code: string
    name: string
  }

  province: {
    code: string
    name: string
  }
}

export interface CreateAddressDto {
  districtCode: string
  provinceCode: string
  detail?: string
  isDefault?: boolean
}

export interface UpdateAddressDto {
  districtCode?: string
  provinceCode?: string
  detail?: string
  isDefault?: boolean
}
