export const ACCESS_TOKEN_KEY = {
  USER: 'user-access-token',
  ADMIN: 'admin-access-token',
} as const

export const ME_INFO_KEY = {
  USER: 'user',
  ADMIN: 'admin',
} as const

export const LOGIN_ROUTE = {
  USER: '/auth/login',
  ADMIN: '/admin/auth/login',
} as const

export const REFRESH_TOKEN_ENDPOINT = {
  USER: '/auth/refresh-token',
  ADMIN: '/admin/auth/refresh-token',
} as const

export const SORT_ORDER = {
  ASC: 'asc',
  DEST: 'desc',
} as const

export const DEFAULT_IMAGE_URL = 'https://ui.shadcn.com/placeholder.svg'

const getBaseApiUrl = (): string => {
  let url = (
    import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'
  ).trim()
  if (url.endsWith('/')) {
    url = url.slice(0, -1)
  }
  if (!url.endsWith('/api/v1')) {
    url = `${url}/api/v1`
  }
  return url
}

export const API_BASE_URL = getBaseApiUrl()

