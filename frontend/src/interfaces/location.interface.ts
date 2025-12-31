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

export interface CreateAddressPayload {
  districtCode: string
  provinceCode: string
  detail?: string
  isDefault?: boolean
}

export interface UpdateAddressPayload {
  districtCode?: string
  provinceCode?: string
  detail?: string
  isDefault?: boolean
}

export interface Province {
  code: string
  name: string
  nameEn: string
  fullName: string
  fullNameEn: string
  codeName: string
}

export interface District {
  code: string
  name: string
  nameEn: string
  fullName: string
  fullNameEn: string
  codeName: string
  provinceCode: string
}
