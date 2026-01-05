export interface Product {
  id: number
  name: string
  sku: string
  shortDescription?: string | null
  description?: string | null
  status: 'active' | 'inactive' | 'out_of_stock' | 'draft'
  brandId: number
  categoryId: number
  isFeatured: boolean
  weightGrams?: number | null
  publishedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  brand?: {
    id: number
    name: string
  }
  category?: {
    id: number
    name: string
  }
  variants?: ProductVariant[]
  productImages?: ProductImage[]
  minPrice?: number | null
}

export interface ProductVariant {
  id: number
  productId: number
  sku: string
  title?: string | null
  price: number
  costPrice?: number | null
  msrp?: number | null
  stockQuantity: number
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  attributeValues?: AttributeValue[]
  productImages?: ProductImage[]
}

export interface AttributeValue {
  id: number
  attributeId: number
  valueText: string
  attribute?: {
    id: number
    name: string
  }
}

export interface ProductImage {
  imageId: number
  productId: number
  variantId: number | null
  url: string
  altText?: string | null
  isPrimary: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface CreateProductVariant {
  sku: string
  title?: string
  price: number
  costPrice?: number
  msrp?: number
  stockQuantity: number
  isDefault: boolean
  attributes?: {
    attributeName: string
    value: string
  }[]
  images?: {
    url: string
    altText?: string
    isPrimary: boolean
  }[]
}

export interface CreateProduct {
  name: string
  sku: string
  description?: string
  status: 'active' | 'inactive' | 'draft' | 'out_of_stock'
  brandId: number
  categoryId: number
  isFeatured?: boolean
  variants: CreateProductVariant[]
  images?: {
    url: string
    altText?: string
    isPrimary: boolean
  }[]
}

export type UpdateProduct = CreateProduct

export type SelectedAttributes = Record<string, string>

export interface Attribute {
  name: string
  values: string[]
}
