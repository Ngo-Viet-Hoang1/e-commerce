import type {
  IApiResponse,
  IPaginatedResponse,
} from '@/interfaces/base-response.interface'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import type { Product } from '@/interfaces/product.interface'
import { api } from '../..'

export interface GetProductsParams extends PaginationParams {
  sku?: string
}

class ProductService {
  static getPaginated = async (params: GetProductsParams) => {
    const { data } = await api.get<IPaginatedResponse<Product>>('/products', {
      params,
    })
    return data
  }

  static getById = async (id: number) => {
    const { data } = await api.get<IApiResponse<Product>>(`/products/${id}`)
    return data
  }

  static getBySlug = async (slug: string) => {
    const { data } = await api.get<IApiResponse<Product>>(
      `/products/slug/${slug}`,
    )
    return data
  }
}

export default ProductService
