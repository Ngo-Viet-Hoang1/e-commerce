import type { Prisma } from '@generated/prisma/client'
import {
  ConflictException,
  NotFoundException,
} from '../../shared/models/app-error.model'
import productRepository from './product.repository'
import type {
  CreateProductBody,
  ListProductsQuery,
  UpdateProductBody,
} from './product.schema'

class ProductService {
  findAll = async (query: ListProductsQuery) => {
    const { page, limit, sort, order, search, sku } = query

    if (sku) {
      const where: Prisma.ProductWhereInput = {
        deletedAt: null,
        sku: { equals: sku },
      }

      const products = await productRepository.findMany({ where })

      return {
        products,
        total: products.length,
        page: 1,
        limit: products.length,
      }
    }

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [products, total] = await Promise.all([
      productRepository.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      productRepository.count(where),
    ])

    return { products, total, page, limit }
  }

  async findById(id: number, includeDeleted = false) {
    const product = await productRepository.findById(id, includeDeleted)

    if (!product) throw new NotFoundException(`Product with ID ${id} not found`)

    return product
  }

  async findBySku(sku: string) {
    const product = await productRepository.findBySku(sku)

    if (!product) {
      throw new NotFoundException(`Product with SKU ${sku} not found`)
    }

    return product
  }

  async findByName(name: string) {
    const product = await productRepository.findByName(name)

    if (!product) {
      throw new NotFoundException(`Product with name ${name} not found`)
    }

    return product
  }

  create = async (data: CreateProductBody) => {
    const createData: Prisma.ProductCreateInput = {
      name: data.name!,
      sku: data.sku!,
      status: data.status!,
      brand: { connect: { id: data.brandId! } },
      category: { connect: { id: data.categoryId! } },
      shortDescription: data.shortDescription,
      description: data.description,
      isFeatured: data.isFeatured,
      metaData: data.metaData,
      weightGrams: data.weightGrams,
      dimensions: data.dimensions,
      publishedAt: data.publishedAt,
    }

    const product = await productRepository.create(createData)

    return product
  }

  updateById = async (id: number, data: UpdateProductBody) => {
    await this.findById(id)

    const updateData: Prisma.ProductUpdateInput = {
      name: data.name!,
      sku: data.sku!,
      status: data.status!,
      brand: { connect: { id: data.brandId! } },
      category: { connect: { id: data.categoryId! } },
      shortDescription: data.shortDescription,
      description: data.description,
      isFeatured: data.isFeatured,
      metaData: data.metaData,
      weightGrams: data.weightGrams,
      dimensions: data.dimensions,
      publishedAt: data.publishedAt,
    }

    const product = await productRepository.update(id, updateData)

    return product
  }

  deleteById = async (id: number) => {
    await this.findById(id)

    const deletedProduct = await productRepository.delete(id)

    return deletedProduct
  }

  softDeleteById = async (id: number) => {
    await this.findById(id)

    const softDeletedProduct = await productRepository.softDelete(id)

    return softDeletedProduct
  }

  restoreById = async (id: number) => {
    const product = await this.findById(id, true)

    if (!product) throw new NotFoundException(`Product with ID ${id} not found`)

    if (!product.deletedAt) {
      throw new ConflictException('Product is not deleted')
    }

    const restoredProduct = await productRepository.restore(id)

    return restoredProduct
  }

  exists = async (id: number): Promise<boolean> => {
    return productRepository.exists(id)
  }
}

export const productService = new ProductService()
export default productService
