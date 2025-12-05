import type { PaginationMetadata } from '../interfaces/base-response.interface'

export class PaginationBuilder {
  static calculateMeta(
    page: number,
    limit: number,
    total: number,
  ): PaginationMetadata {
    if (total < 0) {
      throw new Error('Total count cannot be negative')
    }
    if (limit <= 0) {
      throw new Error('Limit must be greater than 0')
    }
    if (page <= 0) {
      throw new Error('Page must be greater than 0')
    }

    if (total === 0) {
      return {
        page: 1,
        limit,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: 0,
        prevPage: 0,
      }
    }

    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : 0,
      prevPage: hasPrevPage ? page - 1 : 0,
    }
  }

  static calculateOffset(page: number, limit: number): number {
    if (page <= 0 || limit <= 0) {
      throw new Error('Page and limit must be greater than 0')
    }
    return (page - 1) * limit
  }

  static isPageOutOfBounds(page: number, totalPages: number): boolean {
    return page > totalPages && totalPages > 0
  }

  static getSafePage(page: number, totalPages: number): number {
    if (totalPages === 0) return 1
    if (page < 1) return 1
    if (page > totalPages) return totalPages
    return page
  }

  static toPrismaParams(page: number, limit: number) {
    return {
      skip: this.calculateOffset(page, limit),
      take: limit,
    }
  }

  static buildPrismaOrderBy(
    sortOptions?: Record<string, string>,
  ): Record<string, string> | Array<Record<string, string>> | undefined {
    if (!sortOptions || Object.keys(sortOptions).length === 0) {
      return undefined
    }

    const entries = Object.entries(sortOptions)

    // Single field - return object
    if (entries.length === 1) {
      const firstEntry = entries[0]
      if (firstEntry) {
        const [field, order] = firstEntry
        return { [field]: order }
      }
    }

    // Multiple fields - return array
    return entries.map(([field, order]) => ({ [field]: order }))
  }

  static buildPrismaQuery(
    page: number,
    limit: number,
    sortOptions?: Record<string, string>,
  ) {
    return {
      ...this.toPrismaParams(page, limit),
      orderBy: this.buildPrismaOrderBy(sortOptions),
    }
  }
}
