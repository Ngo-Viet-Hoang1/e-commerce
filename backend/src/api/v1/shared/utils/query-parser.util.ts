export class QueryParserUtils {
  static parseNumber(
    value: unknown,
    defaultValue?: number,
    min?: number,
    max?: number,
  ): number | undefined {
    if (value === undefined || value === null || value === '') {
      return defaultValue
    }

    const parsed = Number(value)

    if (isNaN(parsed) || !isFinite(parsed)) {
      return defaultValue
    }

    if (min !== undefined && parsed < min) {
      return defaultValue ?? min
    }

    if (max !== undefined && parsed > max) {
      return defaultValue ?? max
    }

    return parsed
  }

  static parseBoolean(
    value: unknown,
    defaultValue?: boolean,
  ): boolean | undefined {
    if (value === undefined || value === null || value === '') {
      return defaultValue
    }

    if (typeof value === 'boolean') {
      return value
    }

    const stringValue = String(value).toLowerCase().trim()

    const truthyValues = ['true', '1', 'yes', 'on']
    const falsyValues = ['false', '0', 'no', 'off']

    if (truthyValues.includes(stringValue)) return true
    if (falsyValues.includes(stringValue)) return false

    return defaultValue
  }

  static parseString(
    value: unknown,
    defaultValue?: string,
    maxLength?: number,
  ): string | undefined {
    if (value === undefined || value === null) {
      return defaultValue
    }

    let stringValue = String(value).trim()

    if (stringValue === '') {
      return defaultValue
    }

    if (maxLength !== undefined && stringValue.length > maxLength) {
      stringValue = stringValue.substring(0, maxLength)
    }

    return stringValue
  }

  static parseArray(value: unknown, separator = ','): string[] | undefined {
    if (value === undefined || value === null) {
      return undefined
    }

    if (Array.isArray(value)) {
      return value.map(String).filter(Boolean)
    }

    const stringValue = String(value).trim()
    if (stringValue === '') {
      return undefined
    }

    return stringValue
      .split(separator)
      .map((s) => s.trim())
      .filter(Boolean)
  }

  static parseEnum<T extends string>(
    value: unknown,
    allowedValues: readonly T[],
    defaultValue?: T,
  ): T | undefined {
    if (value === undefined || value === null || value === '') {
      return defaultValue
    }

    const stringValue = String(value).toLowerCase()

    const found = allowedValues.find((v) => v.toLowerCase() === stringValue)

    return found ?? defaultValue
  }

  static parseDate(value: unknown, defaultValue?: Date): Date | undefined {
    if (value === undefined || value === null || value === '') {
      return defaultValue
    }

    if (value instanceof Date) {
      return isNaN(value.getTime()) ? defaultValue : value
    }

    const parsed = new Date(String(value))
    return isNaN(parsed.getTime()) ? defaultValue : parsed
  }

  static parseJSON<T>(value: unknown, defaultValue?: T): T | undefined {
    if (value === undefined || value === null || value === '') {
      return defaultValue
    }

    try {
      return JSON.parse(String(value)) as T
    } catch {
      return defaultValue
    }
  }
}
