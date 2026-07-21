import { TransactionClient } from '../../generated/prisma/internal/prismaNamespace'
import { prisma } from '../../src/api/v1/shared/config/database/postgres'
import logger from '../../src/api/v1/shared/config/logger'
import {
  PERMISSION_DEFINITIONS,
  ROLE_DEFINITIONS,
} from '../../src/api/v1/shared/constants/rbac'
import { PasswordUtils } from '../../src/api/v1/shared/utils/password.util'
import sanitizeHtml from 'sanitize-html'
import * as fs from 'fs'
import * as path from 'path'

// Type definitions for seed data
interface AttributeData {
  attributeName: string
  value: string
}

interface VariantData {
  sku: string
  title: string
  price: number
  costPrice?: number
  msrp?: number
  stockQuantity: number
  isDefault?: boolean
  attributes?: AttributeData[]
}

interface ImageData {
  url: string
  altText?: string
  isPrimary?: boolean
}

interface VideoData {
  url: string
  variantId?: number
  title?: string
  provider?: string
  thumbnailUrl?: string
  durationSeconds?: number
}

interface FaqData {
  question: string
  answer: string
  status?: string
  isPublic?: boolean
  sortOrder?: number
}

interface BadgeData {
  name: string
  code?: string
}

interface WarrantyPolicyData {
  brandId?: number
  title: string
  description?: string
  durationDays: number
  termsUrl?: string
}

interface ProductData {
  name: string
  sku: string
  description?: string
  status: string
  brandId: number
  categoryId: number
  isFeatured?: boolean
  variants?: VariantData[]
  images?: ImageData[]
  videos?: VideoData[]
  faqs?: FaqData[]
  badges?: BadgeData[]
  warrantyPolicies?: WarrantyPolicyData[]
}

// Import JSON data
const productsData: ProductData[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'products.json'), 'utf-8'),
)

async function runSeedStep<T>(
  label: string,
  work: (tx: TransactionClient) => Promise<T>,
): Promise<T | null> {
  try {
    return await prisma.$transaction(
      async (tx: TransactionClient) => work(tx),
      {
        maxWait: 30000,
        timeout: 180000,
      },
    )
  } catch (error) {
    logger.warn(`⚠️ ${label} failed, continuing with next seed step`, error)
    return null
  }
}

async function seedSingleProduct(
  tx: TransactionClient,
  productData: ProductData,
): Promise<boolean> {
  const {
    variants,
    images,
    videos,
    faqs,
    badges,
    warrantyPolicies,
    ...productInfo
  } = productData

  const [brandExists, categoryExists] = await Promise.all([
    tx.brand.findUnique({ where: { id: productInfo.brandId } }),
    tx.category.findUnique({ where: { id: productInfo.categoryId } }),
  ])

  if (!brandExists) {
    logger.warn(
      `⚠️  Brand ID ${productInfo.brandId} not found, skipping product ${productInfo.sku}`,
    )
    return false
  }
  if (!categoryExists) {
    logger.warn(
      `⚠️  Category ID ${productInfo.categoryId} not found, skipping product ${productInfo.sku}`,
    )
    return false
  }

  const existingProduct = await tx.product.findFirst({
    where: { sku: productInfo.sku },
  })

  if (existingProduct) {
    logger.info(`ℹ️  Product ${productInfo.sku} already exists, skipping`)
    return false
  }

  if (variants && variants.length > 0) {
    const defaultVariants = variants.filter((v) => v.isDefault)
    if (defaultVariants.length === 0) {
      variants[0].isDefault = true
    } else if (defaultVariants.length > 1) {
      logger.warn(
        `⚠️  Product ${productInfo.sku} has multiple default variants, using first one`,
      )
      variants.forEach((v, i) => {
        v.isDefault = i === 0
      })
    }

    const variantSkus = variants.map((v) => v.sku)
    const uniqueSkus = new Set(variantSkus)
    if (uniqueSkus.size !== variantSkus.length) {
      logger.warn(
        `⚠️  Product ${productInfo.sku} has duplicate variant SKUs, skipping`,
      )
      return false
    }

    const existingVariant = await tx.productVariant.findFirst({
      where: { sku: { in: variantSkus } },
    })
    if (existingVariant) {
      logger.warn(
        `⚠️  Variant SKU ${existingVariant.sku} already exists, skipping product ${productInfo.sku}`,
      )
      return false
    }
  }

  const product = await tx.product.create({
    data: {
      name: productInfo.name,
      sku: productInfo.sku,
      description: sanitizeHtml(productInfo.description || ''),
      status: productInfo.status,
      brandId: productInfo.brandId,
      categoryId: productInfo.categoryId,
      isFeatured: productInfo.isFeatured,
    },
  })

  if (variants && variants.length > 0) {
    const allAttributeNames = new Set<string>()
    const allAttributeData = new Map<string, Set<string>>()

    for (const variant of variants) {
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
        name: {
          in: Array.from(allAttributeNames),
          mode: 'insensitive',
        },
        deletedAt: null,
      },
      include: {
        values: {
          where: { deletedAt: null },
        },
      },
    })

    const attributeMap = new Map<string, (typeof existingAttributes)[0]>()
    existingAttributes.forEach((attr) => {
      attributeMap.set(attr.name.toLowerCase(), attr)
    })

    const attributesToCreate = Array.from(allAttributeNames)
      .filter((name) => !attributeMap.has(name))
      .map((name) => ({
        name:
          variants
            .flatMap((v) => v.attributes || [])
            .find((a) => a.attributeName.trim().toLowerCase() === name)
            ?.attributeName.trim() || name,
        inputType: 'text',
        isFilterable: true,
        isSearchable: false,
      }))

    if (attributesToCreate.length > 0) {
      const newAttributes = await tx.attribute.createManyAndReturn({
        data: attributesToCreate,
      })
      newAttributes.forEach((attr) => {
        attributeMap.set(attr.name.toLowerCase(), {
          ...attr,
          values: [],
        })
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
        skipDuplicates: true,
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

    await Promise.all(
      variants.map(async (variant) => {
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
            productId: product.id,
            sku: variant.sku,
            title: variant.title,
            price: variant.price,
            costPrice: variant.costPrice,
            msrp: variant.msrp,
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
  }

  if (images && images.length > 0) {
    await tx.productImage.createMany({
      data: images.map((img, index) => ({
        productId: product.id,
        variantId: null,
        url: img.url,
        altText: img.altText,
        isPrimary: img.isPrimary,
        sortOrder: index,
      })),
    })
  }

  if (videos && videos.length > 0) {
    await tx.productVideo.createMany({
      data: videos.map((video) => ({
        productId: product.id,
        variantId: video.variantId || null,
        url: video.url,
        title: video.title,
        provider: video.provider,
        thumbnailUrl: video.thumbnailUrl,
        durationSeconds: video.durationSeconds,
      })),
    })
  }

  if (faqs && faqs.length > 0) {
    await tx.productFaq.createMany({
      data: faqs.map((faq) => ({
        productId: product.id,
        question: faq.question,
        answer: faq.answer,
        status: faq.status || 'pending',
        isPublic: faq.isPublic ?? false,
        sortOrder: faq.sortOrder || 0,
      })),
    })
  }

  if (badges && badges.length > 0) {
    for (const badgeData of badges) {
      const badgeCode =
        badgeData.code || badgeData.name.toLowerCase().replace(/\s+/g, '_')
      const badge = await tx.badge.upsert({
        where: { code: badgeCode },
        update: { name: badgeData.name },
        create: { name: badgeData.name, code: badgeCode },
      })

      await tx.productBadge.upsert({
        where: {
          productId_badgeId: {
            productId: product.id,
            badgeId: badge.id,
          },
        },
        update: {},
        create: {
          productId: product.id,
          badgeId: badge.id,
        },
      })
    }
  }

  if (warrantyPolicies && warrantyPolicies.length > 0) {
    await tx.warrantyPolicy.createMany({
      data: warrantyPolicies.map((policy) => ({
        productId: product.id,
        brandId: policy.brandId || product.brandId,
        title: policy.title,
        description: policy.description,
        durationDays: policy.durationDays,
        termsUrl: policy.termsUrl,
      })),
    })
  }

  return true
}

async function seed() {
  logger.info('⏳ Start seeding...')

  try {
    await runSeedStep('permissions, roles, and admin user', async (tx) => {
      logger.info('📝 Seeding permissions...')
      const createdPermissions = await Promise.all(
        PERMISSION_DEFINITIONS.map((perm) =>
          tx.permission.upsert({
            where: {
              resource_action: {
                resource: perm.resource,
                action: perm.action,
              },
            },
            update: { description: perm.description },
            create: {
              resource: perm.resource,
              action: perm.action,
              description: perm.description,
            },
          }),
        ),
      )
      logger.info(`✅ Created/Updated ${createdPermissions.length} permissions`)

      logger.info('📝 Seeding roles...')
      const createdRoles = await Promise.all(
        ROLE_DEFINITIONS.map((role) =>
          tx.role.upsert({
            where: { name: role.name },
            update: {
              description: role.description,
              isActive: true,
            },
            create: {
              name: role.name,
              description: role.description,
              isActive: true,
            },
          }),
        ),
      )
      logger.info(`✅ Created/Updated ${createdRoles.length} roles`)

      logger.info('🔗 Mapping permissions to roles...')
      const permissionMap = new Map(
        createdPermissions.map((p) => [`${p.resource}:${p.action}`, p.id]),
      )
      const roleMap = new Map(createdRoles.map((r) => [r.name, r.id]))

      await tx.rolePermission.deleteMany({})

      const rolePermissionRecords = []
      for (const roleDef of ROLE_DEFINITIONS) {
        const roleId = roleMap.get(roleDef.name)
        if (!roleId) {
          logger.warn(`⚠️  Role "${roleDef.name}" not found`)
          continue
        }

        for (const permissionKey of roleDef.permissions) {
          const permId = permissionMap.get(permissionKey)
          if (!permId) {
            logger.warn(`⚠️  Permission "${permissionKey}" not found`)
            continue
          }

          rolePermissionRecords.push({ roleId, permissionId: permId })
        }
      }

      if (rolePermissionRecords.length > 0) {
        await tx.rolePermission.createMany({
          data: rolePermissionRecords,
          skipDuplicates: true,
        })
        logger.info(
          `✅ Created ${rolePermissionRecords.length} role-permission mappings`,
        )
      }

      logger.info('👤 Creating default admin user...')
      const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123'
      const hashedPassword = await PasswordUtils.hashPassword(adminPassword)
      const adminRole = createdRoles.find((r) => r.name === 'admin')

      if (!adminRole) throw new Error('Admin role not found!')

      const adminUser = await tx.user.upsert({
        where: { email: 'admin@example.com' },
        update: { isActive: true, emailVerified: true },
        create: {
          email: 'admin@example.com',
          password: hashedPassword,
          name: 'Admin User',
          isActive: true,
          emailVerified: true,
          isMfaActive: false,
        },
      })

      await tx.userRole.upsert({
        where: {
          userId_roleId: {
            userId: adminUser.id,
            roleId: adminRole.id,
          },
        },
        update: {},
        create: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      })
      logger.info('✅ Admin user created')
    })

    await runSeedStep('brands', async (tx) => {
      logger.info('🏢 Seeding brands...')
      const brandsSqlFile = path.join(__dirname, 'brands.sql')
      if (fs.existsSync(brandsSqlFile)) {
        const brandsSql = fs.readFileSync(brandsSqlFile, 'utf-8')
        await tx.$executeRawUnsafe(brandsSql)
        const brandCount = await tx.brand.count()
        logger.info(
          `✅ Brands seeded from SQL with fixed IDs (${brandCount} brands)`,
        )
      } else {
        logger.warn('⚠️  brands.sql not found')
      }
    })

    await runSeedStep('categories', async (tx) => {
      logger.info('📂 Seeding categories...')
      const categoriesSqlFile = path.join(__dirname, 'categories.sql')
      if (fs.existsSync(categoriesSqlFile)) {
        const categoriesSql = fs.readFileSync(categoriesSqlFile, 'utf-8')
        await tx.$executeRawUnsafe(categoriesSql)
        const categoryCount = await tx.category.count()
        logger.info(
          `✅ Categories seeded from SQL with fixed IDs (${categoryCount} categories)`,
        )
      } else {
        logger.warn('⚠️  categories.sql not found')
      }
    })

    await runSeedStep('provinces and districts', async (tx) => {
      logger.info('🗺️  Seeding provinces and districts...')
      const sqlFilePath = path.join(__dirname, 'provinces-districts.sql')

      if (fs.existsSync(sqlFilePath)) {
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8')
        const sqlStatements = sqlContent
          .split('\n')
          .filter((line) => !line.trim().startsWith('--') && line.trim() !== '')
          .join('\n')

        if (sqlStatements.trim().length > 0) {
          await tx.$executeRawUnsafe(sqlStatements)
          const provinceCount = await tx.province.count()
          const districtCount = await tx.district.count()
          logger.info(
            `✅ Provinces and districts seeded (${provinceCount} provinces, ${districtCount} districts)`,
          )
        }
      } else {
        logger.warn('⚠️  provinces-districts.sql not found')
      }
    })

    logger.info('📦 Seeding products...')
    let productCount = 0
    for (const productData of productsData) {
      const created = await runSeedStep(
        `product ${productData.sku}`,
        async (tx) => seedSingleProduct(tx, productData),
      )
      if (created) {
        productCount += 1
      }
    }

    logger.info(`✅ Created ${productCount} products`)
    logger.info('✅ Seeding completed successfully!')
  } catch (error) {
    logger.error('❌ Seeding failed:', error)
    throw error
  }
}

seed()
  .catch((err) => {
    logger.error('Fatal error:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
