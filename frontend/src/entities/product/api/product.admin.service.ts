import type {
  IApiResponse,
  IPaginatedResponse,
} from '@/shared/types'
import type { CreateProduct, Product } from '@/entities/product'
import type { PaginationParams } from '@/shared/types'
import { adminApi } from '@/shared/api'

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

  static getBySlug = async (slug: string) => {
    const { data } = await adminApi.get<IApiResponse<Product>>(
      `/products/slug/${slug}`,
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
