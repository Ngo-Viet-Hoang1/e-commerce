import type {
  IApiResponse,
  IPaginatedResponse,
} from '@/interfaces/base-response.interface'
import type { District, Province } from '@/interfaces/location.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { api } from '../..'

class LocationService {
  static getProvinces = async (params?: PaginationParams) => {
    const { data } = await api.get<IPaginatedResponse<Province>>('/provinces', {
      params: { limit: 100, ...params },
    })
    return data
  }

  static getProvinceByCode = async (code: string) => {
    const { data } = await api.get<IApiResponse<Province>>(`/provinces/${code}`)
    return data
  }

  static getDistricts = async (params?: PaginationParams) => {
    const { data } = await api.get<IPaginatedResponse<District>>('/districts', {
      params: { limit: 100, ...params },
    })
    return data
  }

  static getDistrictsByProvinceCode = async (provinceCode: string) => {
    const { data } = await api.get<IApiResponse<District[]>>(
      `/districts/province/${provinceCode}`,
    )
    return data
  }

  static getDistrictByCode = async (code: string) => {
    const { data } = await api.get<IApiResponse<District>>(`/districts/${code}`)
    return data
  }
}

export default LocationService
