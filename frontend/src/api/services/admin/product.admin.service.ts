import type {
  IApiResponse,
  IPaginatedResponse,
} from '@/interfaces/base-response.interface'
import type { CreateProduct, Product } from '@/interfaces/product.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { adminApi } from '../..'

export interface GetProductsParams extends PaginationParams {
  sku?: string
}

class AdminProductService {
  static getPaginated = async (params: GetProductsParams) => {
    const { data } = await adminApi.get<IPaginatedResponse<Product>>(
      '/products',
      {
        params,
      },
    )
    return data
  }

  static getById = async (id: number) => {
    const { data } = await adminApi.get<IApiResponse<Product>>(
      `/products/${id}`,
    )
    return data
  }

  static create = async (productData: CreateProduct) => {
    const { data } = await adminApi.post<IApiResponse<Product>>(
      '/products/simple',
      productData,
    )
    return data
  }

  static update = async (id: number, productData: Partial<CreateProduct>) => {
    const { data } = await adminApi.put<IApiResponse<Product>>(
      `/products/${id}`,
      productData,
    )
    return data
  }

  static delete = async (id: number) => {
    const { data } = await adminApi.delete<IApiResponse<Product>>(
      `/products/${id}`,
    )
    return data
  }

  static softDelete = async (id: number) => {
    const { data } = await adminApi.delete<IApiResponse<Product>>(
      `/products/${id}/soft`,
    )
    return data
  }

  static restore = async (id: number) => {
    const { data } = await adminApi.patch<IApiResponse<Product>>(
      `/products/${id}/restore`,
    )
    return data
  }
}

export default AdminProductService
