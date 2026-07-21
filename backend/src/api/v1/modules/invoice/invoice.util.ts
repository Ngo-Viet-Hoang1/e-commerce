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
