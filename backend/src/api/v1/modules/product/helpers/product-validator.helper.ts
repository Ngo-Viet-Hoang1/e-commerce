import { prisma } from '../../../shared/config/database/postgres'
import {
  ConflictException,
  NotFoundException,
} from '../../../shared/models/app-error.model'
import type { CreateSimpleProductBody } from '../product.schema'

export class ProductValidator {
  static validateBrandAndCategory = async (
    brandId: number,
    categoryId: number,
  ): Promise<void> => {
    const [brandExists, categoryExists] = await Promise.all([
      prisma.brand.findUnique({ where: { id: brandId } }),
      prisma.category.findUnique({ where: { id: categoryId } }),
    ])

    if (!brandExists) {
      throw new NotFoundException(`Brand with ID ${brandId} not found`)
    }
    if (!categoryExists) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`)
    }
  }

  static validateAndNormalizeVariants = (
    data: CreateSimpleProductBody,
  ): void => {
    const defaultVariants = data.variants.filter((v) => v.isDefault)

    // Auto-set first variant as default if none specified
    if (defaultVariants.length === 0) {
      if (data.variants.length > 0 && data.variants[0]) {
        data.variants[0].isDefault = true
      }
    } else if (defaultVariants.length > 1) {
      throw new ConflictException('Only one variant can be set as default')
    }

    // Check for duplicate variant SKUs within the request
    const variantSkus = data.variants.map((v) => v.sku)
    const uniqueSkus = new Set(variantSkus)
    if (uniqueSkus.size !== variantSkus.length) {
      throw new ConflictException('Duplicate variant SKUs found')
    }
  }

  static validateSkuUniqueness = async (
    productSku: string,
    variantSkus: string[],
  ): Promise<void> => {
    const [existingProduct, existingVariant] = await Promise.all([
      prisma.product.findFirst({ where: { sku: productSku } }),
      prisma.productVariant.findFirst({ where: { sku: { in: variantSkus } } }),
    ])

    if (existingProduct) {
      throw new ConflictException(
        `Product with SKU ${productSku} already exists`,
      )
    }

    if (existingVariant) {
      throw new ConflictException(
        `Variant with SKU ${existingVariant.sku} already exists`,
      )
    }
  }

  static validateCreateSimpleData = async (
    data: CreateSimpleProductBody,
  ): Promise<void> => {
    await this.validateBrandAndCategory(data.brandId, data.categoryId)

    this.validateAndNormalizeVariants(data)

    const variantSkus = data.variants.map((v) => v.sku)
    await this.validateSkuUniqueness(data.sku, variantSkus)
  }
}

export default ProductValidator
