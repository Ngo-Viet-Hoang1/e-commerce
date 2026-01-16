/**
 * Formats a value as a date string according to the specified locale.
 * @param value - A Date object, string, or null/undefined
 * @param fallback - Value to return if the input is invalid (default: "—")
 * @param locale - Locale used for formatting (default: "vi-VN")
 * @returns Formatted date string or fallback
 * @example
 * formatDate(new Date()) // "17/12/2025"
 * formatDate("2025-12-17") // "17/12/2025"
 * formatDate(null) // "—"
 */
export function formatDate(
  value?: Date | string | null,
  fallback = '—',
  locale = 'vi-VN',
) {
  if (!value) return fallback
  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date.getTime())) return fallback
  return date.toLocaleDateString(locale)
}

/**
 * Formats a value as a date-time string according to the specified locale.
 * @param value - A Date object, string, or null/undefined
 * @param fallback - Value to return if the input is invalid (default: "—")
 * @param locale - Locale used for formatting (default: "vi-VN")
 * @returns Formatted date-time string or fallback
 * @example
 * formatDateTime(new Date()) // "17/12/2025, 10:30:00"
 */
export function formatDateTime(
  value?: Date | string | null,
  fallback = '—',
  locale = 'vi-VN',
) {
  if (!value) return fallback
  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date.getTime())) return fallback
  return date.toLocaleString(locale)
}

/**
 * Formats a value as relative time (e.g., "5s ago", "10m ago", "2h ago", "3d ago").
 * @param value - A Date object, string, or null/undefined
 * @param fallback - Value to return if the input is invalid
 * @returns Relative time string
 * @example
 * formatRelativeTime(new Date(Date.now() - 60000)) // "1m ago"
 */
export function formatRelativeTime(
  value?: Date | string | null,
  fallback = '—',
) {
  if (!value) return fallback
  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date.getTime())) return fallback

  const diff = Date.now() - date.getTime()
  const seconds = Math.floor(diff / 1000)

  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

/**
 * Formats a number according to the specified locale with thousands separators.
 * @param value - number, string, null, or undefined
 * @param fallback - Value to return if the input is invalid
 * @param locale - Locale for formatting (default: "vi-VN")
 * @returns Formatted number string or fallback
 * @example
 * formatNumber(1000000) // "1.000.000"
 */
export function formatNumber(
  value?: number | string | null,
  fallback = '—',
  locale = 'vi-VN',
) {
  if (value === null || value === undefined) return fallback
  const num = Number(value)
  if (isNaN(num)) return fallback
  return new Intl.NumberFormat(locale).format(num)
}

/**
 * Formats a number as currency according to the specified locale and currency code.
 * @param value - number, string, null, or undefined
 * @param currency - Currency code (default: "VND")
 * @param fallback - Value to return if the input is invalid
 * @param locale - Locale for formatting (default: "vi-VN")
 * @returns Formatted currency string or fallback
 * @example
 * formatCurrency(1000000) // "1.000.000 ₫"
 * formatCurrency(100, "USD") // "$100.00"
 */
export function formatCurrency(
  value?: number | string | null,
  currency = 'VND',
  fallback = '—',
  locale = 'vi-VN',
) {
  if (value === null || value === undefined) return fallback
  const num = Number(value)
  if (isNaN(num)) return fallback

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(num)
}

/**
 * Formats a number as a percentage string.
 * @param value - number | null | undefined
 * @param fallback - Value to return if the input is invalid
 * @returns Formatted percentage string
 * @example
 * formatPercent(50) // "50%"
 */
export function formatPercent(value?: number | null, fallback = '—') {
  if (value === null || value === undefined) return fallback
  return `${value}%`
}

/**
 * Formats a boolean value into a display string.
 * @param value - boolean | null | undefined
 * @param trueText - Text to display if true (default: "Yes")
 * @param falseText - Text to display if false (default: "No")
 * @param fallback - Value to display if input is null/undefined (default: "—")
 * @returns Formatted string
 */
export function formatBoolean(
  value?: boolean | null,
  trueText = 'Yes',
  falseText = 'No',
  fallback = '—',
) {
  if (value === null || value === undefined) return fallback
  return value ? trueText : falseText
}

/**
 * Returns text or fallback if empty.
 */
export function formatText(value?: string | null, fallback = '—') {
  if (!value || value.trim() === '') return fallback
  return value
}

/**
 * Converts a string to uppercase.
 */
export function formatUppercase(value?: string | null, fallback = '—') {
  if (!value) return fallback
  return value.toUpperCase()
}

/**
 * Converts a string to lowercase.
 */
export function formatLowercase(value?: string | null, fallback = '—') {
  if (!value) return fallback
  return value.toLowerCase()
}

/**
 * Truncates a string if it exceeds the specified length and appends an ellipsis.
 */
export function formatTruncate(
  value?: string | null,
  length = 20,
  fallback = '—',
) {
  if (!value) return fallback
  return value.length > length ? `${value.slice(0, length)}…` : value
}

/**
 * Converts an array to a string with a separator.
 * @param value - Array to join
 * @param separator - Separator string (default: ", ")
 * @param fallback - Value to display if array is empty or null
 * @returns Joined string or fallback
 * @example
 * formatArray(['apple', 'banana']) // "apple, banana"
 */
export function formatArray(
  value?: unknown[] | null,
  separator = ', ',
  fallback = '—',
) {
  if (!value || value.length === 0) return fallback
  return value.join(separator)
}

/**
 * Maps a string value using a map object, returns fallback if missing.
 * @param value - Input string
 * @param map - Record<string, string> mapping values
 * @param fallback - Value to return if input is missing
 * @returns Mapped string or fallback
 * @example
 * formatEnum('admin', { admin: 'Administrator', user: 'User' }) // "Administrator"
 */
export function formatEnum(
  value?: string | null,
  map?: Record<string, string>,
  fallback = '—',
) {
  if (!value) return fallback
  return map?.[value] ?? value
}

/**
 * Converts a value to a pretty JSON string with 2-space indentation.
 * @param value - Any object or array
 * @param fallback - Value to return if conversion fails
 * @returns JSON string or fallback
 * @example
 * formatJson({ a: 1 }) // "{\n  "a": 1\n}"
 */
export function formatJson(value?: unknown, fallback = '—') {
  if (!value) return fallback
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return fallback
  }
}
