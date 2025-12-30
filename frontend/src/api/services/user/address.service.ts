import type {
  Address,
  CreateAddressDto,
  UpdateAddressDto,
} from '@/interfaces/address.interface'
import type {
  IApiResponse,
  IPaginatedResponse,
} from '@/interfaces/base-response.interface'
import { api } from '../..'

class AddressService {
  static getAll = async (params?: {
    page?: number
    limit?: number
    isDefault?: boolean
  }) => {
    const { data } = await api.get<IPaginatedResponse<Address>>('/addresses', {
      params,
    })
    return data
  }

  static getById = async (id: number) => {
    const { data } = await api.get<IApiResponse<Address>>(`/addresses/${id}`)
    return data
  }

  static create = async (payload: CreateAddressDto) => {
    const { data } = await api.post<IApiResponse<Address>>(
      '/addresses',
      payload,
    )
    return data
  }

  static update = async (id: number, payload: UpdateAddressDto) => {
    const { data } = await api.put<IApiResponse<Address>>(
      `/addresses/${id}`,
      payload,
    )
    return data
  }

  static delete = async (id: number) => {
    const { data } = await api.delete<IApiResponse>(`/addresses/${id}`)
    return data
  }

  static setDefault = async (id: number) => {
    const { data } = await api.put<IApiResponse<Address>>(
      `/addresses/${id}/default`,
    )
    return data
  }
}

export default AddressService
