import type { Prisma } from '@generated/prisma/client'
import sanitizeHtml from 'sanitize-html'
import { prisma } from '../../shared/config/database/postgres'
import {
  ConflictException,
  NotFoundException,
} from '../../shared/models/app-error.model'
import {
  AttributeResolver,
  ImageHandler,
  ProductValidator,
  VariantBuilder,
} from './helpers'
import productRepository from './product.repository'
import type {
  CreateProductBody,
  CreateSimpleProductBody,
  ListBestSellersQuery,
  ListProductsQuery,
  UpdateProductBody,
} from './product.schema'

class ProductService {
  findBestSellers = async (query: ListBestSellersQuery) => {
    const limit = query.limit ?? 8
    const orderedProductIds =
      await productRepository.findBestSellerProductIds(limit)

    if (orderedProductIds.length === 0) {
      const fallbackProducts = await productRepository.findMany({
        where: {
          deletedAt: null,
          status: 'active',
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        take: limit,
      })

      const productIds = fallbackProducts.map((p) => p.id)
      const minPriceMap = await productRepository.getMinPricesBatch(productIds)

      return fallbackProducts.map((product) => ({
        ...product,
        minPrice: (minPriceMap.get(product.id) as any) ?? null,
      }))
    }

    const products = await productRepository.findMany({
      where: {
        deletedAt: null,
        status: 'active',
        id: {
          in: orderedProductIds,
        },
      },
    })

    const productMap = new Map(products.map((product) => [product.id, product]))
    const minPriceMap = await productRepository.getMinPricesBatch(orderedProductIds)

    const orderedProducts = orderedProductIds
      .map((id) => productMap.get(id))
      .filter((product): product is NonNullable<typeof product> =>
        Boolean(product),
      )
      .map((product) => ({
        ...product,
        minPrice: (minPriceMap.get(product.id) as any) ?? null,
      }))

    return orderedProducts
  }

  findAll = async (query: ListProductsQuery) => {
    const { page, limit, sort, order, search, sku, isFeatured, brandId } = query

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
      ...(isFeatured !== undefined && { isFeatured }),
      ...(brandId !== undefined && { brandId }),
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

    const productIds = products.map((p) => p.id)
    const minPriceMap = await productRepository.getMinPricesBatch(productIds)

    const productsWithMinPrice = products.map((product) => ({
      ...product,
      minPrice: (minPriceMap.get(product.id) as any) ?? null,
    }))

    return { products: productsWithMinPrice, total, page, limit }
  }

  async findById(id: number, includeDeleted = false) {
    const product = await productRepository.findById(id, includeDeleted)

    if (!product) throw new NotFoundException(`Product with ID ${id} not found`)

    const minPrice = await productRepository.getMinPrice(id)

    return {
      ...product,
      minPrice,
    }
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
    const existing = await this.findById(id)
    if (!existing) throw new NotFoundException(`Product with ID ${id} not found`)

    // Check SKU uniqueness if SKU is changing
    if (data.sku && data.sku !== existing.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: data.sku },
      })
      if (skuExists && skuExists.id !== id) {
        throw new ConflictException(`Product SKU "${data.sku}" is already in use`)
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update basic product fields
      const updateData: Prisma.ProductUpdateInput = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.sku !== undefined) updateData.sku = data.sku
      if (data.status !== undefined) updateData.status = data.status
      if (data.brandId !== undefined) {
        updateData.brand = { connect: { id: data.brandId } }
      }
      if (data.categoryId !== undefined) {
        updateData.category = { connect: { id: data.categoryId } }
      }
      if (data.description !== undefined) {
        updateData.description = sanitizeHtml(data.description || '')
      }
      if (data.shortDescription !== undefined) {
        updateData.shortDescription = data.shortDescription
      }
      if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured
      if (data.weightGrams !== undefined) updateData.weightGrams = data.weightGrams
      if (data.dimensions !== undefined) updateData.dimensions = data.dimensions
      if (data.metaData !== undefined) updateData.metaData = data.metaData
      if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt

      await tx.product.update({
        where: { id },
        data: updateData,
      })

      // 2. If variants are provided, update variants & variant attributes
      if (data.variants && data.variants.length > 0) {
        // Resolve attribute values for all variants
        const { attributeValueMap } = await AttributeResolver.resolveAttributes(
          tx,
          data.variants,
        )

        // Delete old product images and old variants
        await tx.productImage.deleteMany({
          where: { productId: id },
        })

        await tx.productVariant.deleteMany({
          where: { productId: id },
        })

        // Re-create variants with new attributes
        const createdVariants = await VariantBuilder.createVariants(
          tx,
          id,
          data.variants,
          attributeValueMap,
        )

        // Re-create all images (product images + variant images)
        await ImageHandler.createAllImages(
          tx,
          id,
          {
            name: data.name ?? existing.name,
            sku: data.sku ?? existing.sku,
            brandId: data.brandId ?? existing.brand.id,
            categoryId: data.categoryId ?? existing.category.id,
            isFeatured: data.isFeatured ?? existing.isFeatured,
            status:
              data.status === 'out_of_stock'
                ? 'inactive'
                : ((data.status ?? existing.status) as
                    | 'active'
                    | 'inactive'
                    | 'draft'),
            variants: data.variants,
            images: data.images,
          },
          createdVariants,
        )
      } else if (data.images) {
        // If only product images changed
        await tx.productImage.deleteMany({
          where: { productId: id, variantId: null },
        })
        await ImageHandler.createProductImages(tx, id, data.images)
      }

      return id
    })

    return await productRepository.findById(updated)
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

  createSimple = async (data: CreateSimpleProductBody) => {
    await ProductValidator.validateCreateSimpleData(data)

    const product = await prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({
        data: {
          name: data.name,
          sku: data.sku,
          description: sanitizeHtml(data.description || ''),
          status: data.status,
          brandId: data.brandId,
          categoryId: data.categoryId,
        },
      })

      const { attributeValueMap } = await AttributeResolver.resolveAttributes(
        tx,
        data.variants,
      )

      const createdVariants = await VariantBuilder.createVariants(
        tx,
        createdProduct.id,
        data.variants,
        attributeValueMap,
      )

      await ImageHandler.createAllImages(
        tx,
        createdProduct.id,
        data,
        createdVariants,
      )

      return createdProduct
    })

    return await productRepository.findById(product.id)
  }
}

export const productService = new ProductService()
export default productService
