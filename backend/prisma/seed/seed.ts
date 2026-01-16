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

async function seed() {
  logger.info('⏳ Start seeding...')

  try {
    await prisma.$transaction(
      async (tx: TransactionClient) => {
        // 1️⃣ Seed permissions from constants
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
        logger.info(
          `✅ Created/Updated ${createdPermissions.length} permissions`,
        )

        // 2️⃣ Seed roles from constants
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

        // 3️⃣ Map permissions to each role
        logger.info('🔗 Mapping permissions to roles...')
        const permissionMap = new Map(
          createdPermissions.map((p) => [`${p.resource}:${p.action}`, p.id]),
        )
        const roleMap = new Map(createdRoles.map((r) => [r.name, r.id]))

        // Clear existing mappings
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

        // 4️⃣ Create admin user
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

        // 5️⃣ Seed Brands from SQL (with explicit IDs)
        logger.info('🏢 Seeding brands...')
        const brandsSqlFile = path.join(__dirname, 'brands.sql')
        if (fs.existsSync(brandsSqlFile)) {
          const brandsSql = fs.readFileSync(brandsSqlFile, 'utf-8')
          await tx.$executeRawUnsafe(brandsSql)

          // Verify brands were inserted
          const brandCount = await tx.brand.count()
          logger.info(
            `✅ Brands seeded from SQL with fixed IDs (${brandCount} brands)`,
          )
        } else {
          logger.warn('⚠️  brands.sql not found')
        }

        // 6️⃣ Seed Categories from SQL (with explicit IDs)
        logger.info('📂 Seeding categories...')
        const categoriesSqlFile = path.join(__dirname, 'categories.sql')
        if (fs.existsSync(categoriesSqlFile)) {
          const categoriesSql = fs.readFileSync(categoriesSqlFile, 'utf-8')
          await tx.$executeRawUnsafe(categoriesSql)

          // Verify categories were inserted
          const categoryCount = await tx.category.count()
          logger.info(
            `✅ Categories seeded from SQL with fixed IDs (${categoryCount} categories)`,
          )
        } else {
          logger.warn('⚠️  categories.sql not found')
        }

        // 7️⃣ Seed Provinces and Districts FIRST (before products)
        logger.info('🗺️  Seeding provinces and districts...')
        const sqlFilePath = path.join(__dirname, 'provinces-districts.sql')

        if (fs.existsSync(sqlFilePath)) {
          const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8')
          const sqlStatements = sqlContent
            .split('\n')
            .filter(
              (line) => !line.trim().startsWith('--') && line.trim() !== '',
            )
            .join('\n')

          if (sqlStatements.trim().length > 0) {
            try {
              await tx.$executeRawUnsafe(sqlStatements)
              const provinceCount = await tx.province.count()
              const districtCount = await tx.district.count()
              logger.info(
                `✅ Provinces and districts seeded (${provinceCount} provinces, ${districtCount} districts)`,
              )
            } catch {
              logger.warn('⚠️  Provinces/districts may already exist')
            }
          }
        } else {
          logger.warn('⚠️  provinces-districts.sql not found')
        }

        // 8️⃣ Seed Products with variants, images, etc.
        logger.info('📦 Seeding products...')

        let productCount = 0
        for (const productData of productsData) {
          const {
            variants,
            images,
            videos,
            faqs,
            badges,
            warrantyPolicies,
            ...productInfo
          } = productData

          // Validate brandId and categoryId exist
          const [brandExists, categoryExists] = await Promise.all([
            tx.brand.findUnique({ where: { id: productInfo.brandId } }),
            tx.category.findUnique({ where: { id: productInfo.categoryId } }),
          ])

          if (!brandExists) {
            logger.warn(
              `⚠️  Brand ID ${productInfo.brandId} not found, skipping product ${productInfo.sku}`,
            )
            continue
          }
          if (!categoryExists) {
            logger.warn(
              `⚠️  Category ID ${productInfo.categoryId} not found, skipping product ${productInfo.sku}`,
            )
            continue
          }

          // Check if product already exists
          const existingProduct = await tx.product.findFirst({
            where: { sku: productInfo.sku },
          })

          if (existingProduct) {
            logger.info(
              `ℹ️  Product ${productInfo.sku} already exists, skipping`,
            )
            continue
          }

          // Validate and fix default variant
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

            // Check for duplicate variant SKUs
            const variantSkus = variants.map((v) => v.sku)
            const uniqueSkus = new Set(variantSkus)
            if (uniqueSkus.size !== variantSkus.length) {
              logger.warn(
                `⚠️  Product ${productInfo.sku} has duplicate variant SKUs, skipping`,
              )
              continue
            }

            // Check if any variant SKU already exists
            const existingVariant = await tx.productVariant.findFirst({
              where: { sku: { in: variantSkus } },
            })
            if (existingVariant) {
              logger.warn(
                `⚠️  Variant SKU ${existingVariant.sku} already exists, skipping product ${productInfo.sku}`,
              )
              continue
            }
          }

          // Create product
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
          productCount++

          // Process variants with attributes (following createSimple logic)
          if (variants && variants.length > 0) {
            // Collect all unique attributes from all variants
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

            // Get existing attributes
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

            const attributeMap = new Map<
              string,
              (typeof existingAttributes)[0]
            >()
            existingAttributes.forEach((attr) => {
              attributeMap.set(attr.name.toLowerCase(), attr)
            })

            // Create missing attributes
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

            // Create missing attribute values
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

            // Get all attribute values for mapping
            const allAttributeValues = await tx.attributeValue.findMany({
              where: {
                attributeId: {
                  in: Array.from(attributeMap.values()).map((a) => a.id),
                },
                deletedAt: null,
              },
            })

            // Create lookup map
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

            // Create variants
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

          // Create product-level images
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

          // Create videos
          if (videos && videos.length > 0) {
            await tx.productVideo.createMany({
              data: videos.map((video) => ({
                productId: product.id,
                variantId: video.variantId || 0,
                url: video.url,
                title: video.title,
                provider: video.provider,
                thumbnailUrl: video.thumbnailUrl,
                durationSeconds: video.durationSeconds,
              })),
            })
          }

          // Create FAQs
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

          // Create badges
          if (badges && badges.length > 0) {
            for (const badgeData of badges) {
              const badgeCode =
                badgeData.code ||
                badgeData.name.toLowerCase().replace(/\s+/g, '_')
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

          // Create warranty policies
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
        }
        logger.info(`✅ Created ${productCount} products`)
      },
      { maxWait: 30000, timeout: 180000 },
    )

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
