import type { Prisma } from '@generated/prisma/client'

export const parseOrderMetadata = <T extends Record<string, unknown>>(
  metadata: Prisma.JsonValue | null,
): Partial<T> => {
  if (
    metadata !== null &&
    typeof metadata === 'object' &&
    !Array.isArray(metadata)
  ) {
    return metadata as Partial<T>
  }
  return {}
}
