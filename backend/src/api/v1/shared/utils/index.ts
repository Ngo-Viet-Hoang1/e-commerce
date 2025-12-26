import { Prisma } from '@generated/prisma/client'

type PrismaJsonInput = Prisma.InputJsonValue | null | undefined

export const normalizeJsonInput = (input: PrismaJsonInput) => {
  if (input === undefined) return undefined
  if (input === null) return Prisma.DbNull
  return input
}
