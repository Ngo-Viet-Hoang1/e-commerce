import type {
  IApiResponse,
  IPaginatedResponse,
} from '@/interfaces/base-response.interface'
import type { District } from '@/interfaces/district.interface'
import type { Province } from '@/interfaces/province.interface'
import { api } from '../..'

class LocationService {
  static getProvinces = async () => {
    const { data } = await api.get<IApiResponse<Province[]>>('/provinces', {
      params: { limit: 100 },
    })
    return data
  }

  static getProvinceByCode = async (code: string) => {
    const { data } = await api.get<IApiResponse<Province>>(`/provinces/${code}`)
    return data
  }

  static getDistricts = async () => {
    const { data } = await api.get<IPaginatedResponse<District[]>>(
      '/districts',
      {
        params: { limit: 100 },
      },
    )
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
