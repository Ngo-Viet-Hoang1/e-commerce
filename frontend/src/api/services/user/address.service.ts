import type {
  IApiResponse,
  IPaginatedResponse,
} from '@/interfaces/base-response.interface'
import type {
  Address,
  CreateAddressPayload,
  UpdateAddressPayload,
} from '@/interfaces/location.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { api } from '../..'

export interface GetAddressesParams extends PaginationParams {
  isDefault?: boolean
}

class AddressService {
  static getAll = async (params?: GetAddressesParams) => {
    const { data } = await api.get<IPaginatedResponse<Address>>('/addresses', {
      params: { limit: 10, ...params },
    })
    return data
  }

  static getById = async (id: number) => {
    const { data } = await api.get<IApiResponse<Address>>(`/addresses/${id}`)
    return data
  }

  static create = async (payload: CreateAddressPayload) => {
    const { data } = await api.post<IApiResponse<Address>>(
      '/addresses',
      payload,
    )
    return data
  }

  static update = async (id: number, payload: UpdateAddressPayload) => {
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
