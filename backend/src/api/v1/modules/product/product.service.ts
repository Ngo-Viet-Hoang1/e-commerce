import type { Prisma } from '@generated/prisma/client'
import sanitizeHtml from 'sanitize-html'
import { prisma } from '../../shared/config/database/postgres'
import {
  ConflictException,
  NotFoundException,
} from '../../shared/models/app-error.model'
import productRepository from './product.repository'
import type {
  CreateProductBody,
  CreateSimpleProductBody,
  ListProductsQuery,
  UpdateProductBody,
} from './product.schema'

class ProductService {
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

    const productsWithMinPrice = await Promise.all(
      products.map(async (product) => {
        const minPrice = await productRepository.getMinPrice(product.id)
        return {
          ...product,
          minPrice,
        }
      }),
    )

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

  createSimple = async (data: CreateSimpleProductBody) => {
    const [brandExists, categoryExists] = await Promise.all([
      prisma.brand.findUnique({ where: { id: data.brandId } }),
      prisma.category.findUnique({ where: { id: data.categoryId } }),
    ])

    if (!brandExists) {
      throw new NotFoundException(`Brand with ID ${data.brandId} not found`)
    }
    if (!categoryExists) {
      throw new NotFoundException(
        `Category with ID ${data.categoryId} not found`,
      )
    }

    const defaultVariants = data.variants.filter((v) => v.isDefault)
    if (defaultVariants.length === 0) {
      if (data.variants.length > 0 && data.variants[0]) {
        data.variants[0].isDefault = true
      }
    } else if (defaultVariants.length > 1) {
      throw new ConflictException('Only one variant can be set as default')
    }

    // Check for duplicate variant SKUs
    const variantSkus = data.variants.map((v) => v.sku)
    const uniqueSkus = new Set(variantSkus)
    if (uniqueSkus.size !== variantSkus.length) {
      throw new ConflictException('Duplicate variant SKUs found')
    }

    //  Check if product SKU or variant SKUs already exist
    const existingProduct = await prisma.product.findFirst({
      where: { sku: data.sku },
    })
    if (existingProduct) {
      throw new ConflictException(`Product with SKU ${data.sku} already exists`)
    }

    const existingVariant = await prisma.productVariant.findFirst({
      where: { sku: { in: variantSkus } },
    })
    if (existingVariant) {
      throw new ConflictException(
        `Variant with SKU ${existingVariant.sku} already exists`,
      )
    }

    //  Create product with variants in transaction
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

      const allAttributeNames = new Set<string>()
      const allAttributeData = new Map<string, Set<string>>() // Map<attributeName, Set<values>>

      for (const variant of data.variants) {
        if (variant.attributes && variant.attributes.length > 0) {
          for (const attr of variant.attributes) {
            const normalizedName = attr.attributeName.trim().toLowerCase()
            allAttributeNames.add(normalizedName)

            if (!allAttributeData.has(normalizedName)) {
              allAttributeData.set(normalizedName, new Set())
            }
            allAttributeData.get(normalizedName)!.add(attr.value.trim())
          }
        }
      }

      const existingAttributes = await tx.attribute.findMany({
        where: {
          name: { in: Array.from(allAttributeNames), mode: 'insensitive' },
          deletedAt: null,
        },
        include: {
          values: {
            where: { deletedAt: null },
          },
        },
      })
      // Create Maps for quick lookup
      const attributeMap = new Map<string, (typeof existingAttributes)[0]>()
      existingAttributes.forEach((attr) => {
        attributeMap.set(attr.name.toLowerCase(), attr)
      })

      const attributesToCreate = Array.from(allAttributeNames)
        .filter((name) => !attributeMap.has(name))
        .map((name) => ({
          name:
            data.variants
              .flatMap((v) => v.attributes || [])
              .find((a) => a.attributeName.trim().toLowerCase() === name)
              ?.attributeName.trim() || name, // Preserve original casing
          inputType: 'text',
          isFilterable: true,
          isSearchable: false,
        }))

      if (attributesToCreate.length > 0) {
        const newAttributes = await tx.attribute.createManyAndReturn({
          data: attributesToCreate,
        })

        newAttributes.forEach((attr) => {
          attributeMap.set(attr.name.toLowerCase(), { ...attr, values: [] })
        })
      }

      const attributeValuesToCreate: Array<{
        attributeId: number
        valueText: string
      }> = []

      for (const [attrName, values] of allAttributeData.entries()) {
        const attribute = attributeMap.get(attrName)
        if (!attribute) continue

        const existingValues = new Set(
          attribute.values.map((v) => v.valueText.toLowerCase()),
        )

        for (const value of values) {
          if (!existingValues.has(value.toLowerCase())) {
            attributeValuesToCreate.push({
              attributeId: attribute.id,
              valueText: value,
            })
          }
        }
      }

      if (attributeValuesToCreate.length > 0) {
        await tx.attributeValue.createMany({
          data: attributeValuesToCreate,
          skipDuplicates: true, // ← Important: Skip if race condition happens
        })
      }

      const allAttributeValues = await tx.attributeValue.findMany({
        where: {
          attributeId: {
            in: Array.from(attributeMap.values()).map((a) => a.id),
          },
          deletedAt: null,
        },
      })

      // Create lookup map: "color|red" → attributeValueId
      const attributeValueMap = new Map<string, number>()
      allAttributeValues.forEach((av) => {
        const attribute = Array.from(attributeMap.values()).find(
          (a) => a.id === av.attributeId,
        )
        if (attribute) {
          const key = `${attribute.name.toLowerCase()}|${av.valueText.toLowerCase()}`
          attributeValueMap.set(key, av.id)
        }
      })

      // ✅ Create Variants (using cached data)
      const createdVariants = await Promise.all(
        data.variants.map(async (variant) => {
          const attributeValueIds: number[] = []

          if (variant.attributes && variant.attributes.length > 0) {
            for (const attr of variant.attributes) {
              const key = `${attr.attributeName.trim().toLowerCase()}|${attr.value.trim().toLowerCase()}`
              const valueId = attributeValueMap.get(key)
              if (valueId) {
                attributeValueIds.push(valueId)
              }
            }
          }

          return await tx.productVariant.create({
            data: {
              productId: createdProduct.id,
              sku: variant.sku,
              title: variant.title,
              price: variant.price,
              costPrice: variant.costPrice,
              stockQuantity: variant.stockQuantity,
              isDefault: variant.isDefault,
              attributeValues:
                attributeValueIds.length > 0
                  ? {
                      connect: attributeValueIds.map((id) => ({ id })),
                    }
                  : undefined,
            },
          })
        }),
      )

      // Create Product-level Images
      if (data.images && data.images.length > 0) {
        await tx.productImage.createMany({
          data: data.images.map((img, index) => ({
            productId: createdProduct.id,
            variantId: null,
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary,
            sortOrder: index,
          })),
        })
      }

      // Create Variant-specific Images
      await Promise.all(
        data.variants.map(async (variant, variantIndex) => {
          if (variant.images && variant.images.length > 0) {
            const createdVariant = createdVariants[variantIndex]
            if (createdVariant) {
              await tx.productImage.createMany({
                data: variant.images.map((img, imgIndex) => ({
                  productId: createdProduct.id,
                  variantId: createdVariant.id,
                  url: img.url,
                  altText: img.altText,
                  isPrimary: img.isPrimary,
                  sortOrder: imgIndex,
                })),
              })
            }
          }
        }),
      )

      return createdProduct
    })

    return await productRepository.findById(product.id)
  }
}

export const productService = new ProductService()
export default productService
