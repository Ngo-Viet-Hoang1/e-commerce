export const sanitizeForLog = (obj: unknown): unknown => {
  const sensitiveKeys = [
    'password',
    'token',
    'apiKey',
    'secret',
    'authorization',
  ]

  if (typeof obj !== 'object' || obj === null) return obj

  const sanitized = { ...obj } as Record<string, unknown>

  for (const key in sanitized) {
    if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeForLog(sanitized[key])
    }
  }

  return sanitized
}
