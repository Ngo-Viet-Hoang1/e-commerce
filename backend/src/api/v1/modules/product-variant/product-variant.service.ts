import type { Prisma } from '@generated/prisma/client'
import {
  ConflictException,
  NotFoundException,
} from '../../shared/models/app-error.model'
import { normalizeJsonInput } from '../../shared/utils'
import { productVariantRepository } from './product-variant.repository'
import {
  type CreateProductVariantBody,
  type ListProductVariantsQuery,
  type UpdateProductVariantBody,
} from './product-variant.schema'
import { mapAttributeValues } from './product-variant.util'

class ProductVariantService {
  findAll = async (query: ListProductVariantsQuery) => {
    const {
      page,
      limit,
      sort,
      order,
      search,
      isDefault,
      backorderable,
      productId,
    } = query

    const where: Prisma.ProductVariantWhereInput = {
      deletedAt: null,
      ...(isDefault !== undefined && { isDefault }),
      ...(backorderable !== undefined && { backorderable }),
      ...(productId !== undefined && { productId }),
      ...(search && {
        OR: [
          { sku: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [productVariants, total] = await Promise.all([
      productVariantRepository.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      productVariantRepository.count(where),
    ])

    const shapedProductVariants = productVariants.map(
      ({ attributeValues, ...pv }) => ({
        ...pv,
        attributes: mapAttributeValues(attributeValues),
      }),
    )

    return { shapedProductVariants, total, page, limit }
  }

  async findById(id: number) {
    const productVariant = await productVariantRepository.findById(id)

    if (!productVariant) {
      throw new NotFoundException('ProductVariant', id.toString())
    }

    const { attributeValues, ...rest } = productVariant

    const shapedProductVariants = {
      ...rest,
      attributes: mapAttributeValues(attributeValues),
    }

    return shapedProductVariants
  }

  create = async (data: CreateProductVariantBody) => {
    const { productId, attributeValueIds, ...createData } = data

    const productVariant = await productVariantRepository.create({
      ...createData,
      metadata: normalizeJsonInput(createData.metadata),
      product: { connect: { id: productId } },
      attributeValues: {
        connect: attributeValueIds.map((id) => ({ id })),
      },
    })

    return productVariant
  }

  updateById = async (id: number, data: UpdateProductVariantBody) => {
    await this.findById(id)

    const { attributeValueIds, ...updateData } = data

    const updatedProductVariant = await productVariantRepository.update(id, {
      ...updateData,
      metadata: normalizeJsonInput(updateData.metadata),
      ...(attributeValueIds && {
        attributeValues: {
          set: attributeValueIds.map((id) => ({ id })),
        },
      }),
    })

    return updatedProductVariant
  }

  deleteById = async (id: number) => {
    await this.findById(id)

    const deletedProductVariant = await productVariantRepository.delete(id)
    return deletedProductVariant
  }

  softDeleteById = async (id: number) => {
    await this.findById(id)

    const softDeletedProductVariant =
      await productVariantRepository.softDelete(id)
    return softDeletedProductVariant
  }

  restoreById = async (id: number) => {
    const productVariant = await productVariantRepository.findById(id, true)

    if (!productVariant) {
      throw new NotFoundException('ProductVariant', id.toString())
    }

    if (!productVariant.deletedAt) {
      throw new ConflictException('ProductVariant is not deleted')
    }

    const restoredProductVariant = await productVariantRepository.restore(id)
    return restoredProductVariant
  }

  exists = async (id: number): Promise<boolean> => {
    return productVariantRepository.exists(id)
  }
}

export const productVariantService = new ProductVariantService()
export default ProductVariantService
