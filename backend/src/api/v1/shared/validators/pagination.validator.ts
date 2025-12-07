import {
  PAGINATION_DEFAULTS,
  SORT_ORDER,
} from '../constants/pagination.constant'
import type {
  PaginationConfig,
  PaginationParams,
  SortConfig,
} from '../interfaces/pagination-params.interface'
import { QueryParserUtils } from '../utils/query-parser.util'

export class PaginationValidator {
  private config: Required<PaginationConfig>

  constructor(config?: PaginationConfig) {
    this.config = {
      allowedSortFields: config?.allowedSortFields ?? [],
      defaultSort: config?.defaultSort ?? 'createdAt',
      defaultOrder: config?.defaultOrder ?? SORT_ORDER.DESC,
      maxLimit: config?.maxLimit ?? PAGINATION_DEFAULTS.MAX_LIMIT,
      minLimit: config?.minLimit ?? PAGINATION_DEFAULTS.MIN_LIMIT,
      defaultLimit: config?.defaultLimit ?? PAGINATION_DEFAULTS.LIMIT,
      maxSortFields: config?.maxSortFields ?? 3,
    }
  }

  validate(params: PaginationParams): PaginationParams {
    // Parse and validate page
    const page = Math.max(
      PAGINATION_DEFAULTS.PAGE,
      QueryParserUtils.parseNumber(
        params.page,
        PAGINATION_DEFAULTS.PAGE,
        PAGINATION_DEFAULTS.PAGE,
      ) ?? PAGINATION_DEFAULTS.PAGE,
    )

    // Parse and validate limit
    const limit = Math.min(
      Math.max(
        this.config.minLimit,
        QueryParserUtils.parseNumber(
          params.limit,
          this.config.defaultLimit,
          this.config.minLimit,
          this.config.maxLimit,
        ) ?? this.config.defaultLimit,
      ),
      this.config.maxLimit,
    )

    // Validate sort field
    let sort = QueryParserUtils.parseString(params.sort)
    const defaultSortString =
      typeof this.config.defaultSort === 'string'
        ? this.config.defaultSort
        : 'createdAt'

    if (
      sort &&
      this.config.allowedSortFields.length > 0 &&
      !this.config.allowedSortFields.includes(sort)
    ) {
      sort = defaultSortString
    }

    // Validate order
    const order = QueryParserUtils.parseEnum(
      params.order,
      [SORT_ORDER.ASC, SORT_ORDER.DESC],
      this.config.defaultOrder,
    )

    // Parse search
    const search = QueryParserUtils.parseString(params.search, undefined, 255)

    // Handle sortOptions (multi-field sorting)
    const sortOptions = this.validateSortOptions(params.sortOptions)

    // If no sortOptions provided, use legacy sort/order
    if (!sortOptions || Object.keys(sortOptions).length === 0) {
      const defaultSort =
        typeof this.config.defaultSort === 'string'
          ? this.config.defaultSort
          : 'createdAt'

      const finalOrder = order || this.config.defaultOrder
      const finalSort = sort || defaultSort

      return {
        page,
        limit,
        sort: finalSort,
        order: finalOrder,
        search,
        filters: params.filters,
        sortOptions: { [finalSort]: finalOrder },
      }
    }

    return {
      page,
      limit,
      search,
      filters: params.filters,
      sortOptions,
    }
  }

  private validateSortOptions(
    sortOptions?: Record<string, unknown>,
  ): SortConfig | undefined {
    if (!sortOptions || Object.keys(sortOptions).length === 0) {
      return undefined
    }

    const validated: SortConfig = {}
    const entries = Object.entries(sortOptions)

    // Limit number of sort fields
    const limitedEntries = entries.slice(0, this.config.maxSortFields)

    for (const [field, order] of limitedEntries) {
      // Validate field is allowed
      if (
        this.config.allowedSortFields.length > 0 &&
        !this.config.allowedSortFields.includes(field)
      ) {
        continue // Skip invalid field
      }

      // Validate order value
      const validOrder = QueryParserUtils.parseEnum(
        order,
        [SORT_ORDER.ASC, SORT_ORDER.DESC],
        this.config.defaultOrder,
      )

      if (validOrder) {
        validated[field] = validOrder
      }
    }

    return Object.keys(validated).length > 0 ? validated : undefined
  }

  static parseFromQuery(
    query: Record<string, unknown>,
    config?: PaginationConfig,
  ): PaginationParams {
    const validator = new PaginationValidator(config)

    // Parse sortOptions from query
    // Support formats:
    // 1. ?sortBy[field1]=asc&sortBy[field2]=desc
    // 2. ?sort=field1:asc,field2:desc
    const sortOptions = this.parseSortOptions(query)

    const params: PaginationParams = {
      page: QueryParserUtils.parseNumber(query.page),
      limit: QueryParserUtils.parseNumber(query.limit),
      sort: QueryParserUtils.parseString(query.sort),
      order: QueryParserUtils.parseEnum(query.order, [
        SORT_ORDER.ASC,
        SORT_ORDER.DESC,
      ]),
      search: QueryParserUtils.parseString(query.search),
      sortOptions,
    }

    return validator.validate(params)
  }

  /**
   * Parse sort options from query string
   * Supports multiple formats:
   * - ?sortBy[price]=asc&sortBy[createdAt]=desc
   * - ?sort=price:asc,createdAt:desc
   */
  private static parseSortOptions(
    query: Record<string, unknown>,
  ): SortConfig | undefined {
    // Format 1: sortBy[field]=order
    if (query.sortBy && typeof query.sortBy === 'object') {
      return query.sortBy as SortConfig
    }

    // Format 2: sort=field1:order1,field2:order2
    const sortString = QueryParserUtils.parseString(query.sort)
    if (sortString && sortString.includes(':')) {
      const sortOptions: SortConfig = {}
      const pairs = sortString.split(',')

      for (const pair of pairs) {
        const [field, order] = pair.split(':').map((s) => s.trim())
        if (
          field &&
          order &&
          (order === SORT_ORDER.ASC || order === SORT_ORDER.DESC)
        ) {
          sortOptions[field] = order
        }
      }

      return Object.keys(sortOptions).length > 0 ? sortOptions : undefined
    }

    return undefined
  }
}
