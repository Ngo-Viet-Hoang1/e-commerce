import { TransactionClient } from '../../generated/prisma/internal/prismaNamespace'
import { prisma } from '../../src/api/v1/shared/config/database/postgres'
import logger from '../../src/api/v1/shared/config/logger'
import {
  PERMISSION_DEFINITIONS,
  ROLE_DEFINITIONS,
} from '../../src/api/v1/shared/constants/rbac'
import { PasswordUtils } from '../../src/api/v1/shared/utils/password.util'

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
      },
      { maxWait: 10000, timeout: 30000 },
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
