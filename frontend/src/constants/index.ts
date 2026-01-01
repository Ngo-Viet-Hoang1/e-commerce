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
