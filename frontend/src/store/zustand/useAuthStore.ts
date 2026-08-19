import AdminAuthService from '@/api/services/admin/auth.admin.service'
import AuthService from '@/api/services/user/auth.service'
import { ACCESS_TOKEN_KEY, API_BASE_URL, REFRESH_TOKEN_ENDPOINT } from '@/constants'
import type { AuthActions, AuthState } from '@/interfaces/auth.interface'
import { storage } from '@/utils/localstorage.util'

import axios from 'axios'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface CreateAuthStoreProps {
  name: string
  tokenKey: string
  refreshTokenEndpoint: string
  getMeService: () => ReturnType<typeof AuthService.getMe>
}

export type AuthStore = AuthState & AuthActions

const createAuthStore = ({
  name,
  tokenKey,
  refreshTokenEndpoint,
  getMeService,
}: CreateAuthStoreProps) => {
  const initialState: AuthState = {
    me: null,
    accessToken: null,
    isAuthenticated: false,
    isInitialized: false,
  }

  const baseURL = API_BASE_URL

  const fetchMe = async () => {
    const { success, data } = await getMeService()
    if (success && data?.me) return data.me
    throw new Error('Failed to fetch user')
  }

  const tryRefreshToken = async (): Promise<string | null> => {
    const refreshApi = axios.create({ baseURL, withCredentials: true })
    const res = await refreshApi.post(refreshTokenEndpoint)
    return res.data?.data?.accessToken ?? null
  }

  const store = create<AuthStore>()(
    devtools(
      (set, get) => ({
        ...initialState,

        setMe: (me) => {
          set({ me, isAuthenticated: !!me })
        },

        setAccessToken: (token: string | null) => {
          set({
            accessToken: token,
            isAuthenticated: !!token,
          })

          if (token) {
            storage.setItem(tokenKey, token)
          } else {
            storage.removeItem(tokenKey)
          }
        },

        reset: () => {
          set({ ...initialState, isInitialized: true })
          storage.removeItem(tokenKey)
        },

        initializeAuth: async () => {
          if (get().isInitialized) return

          const markInitialized = () => set({ isInitialized: true })
          const resetToGuest = () => {
            storage.removeItem(tokenKey)
            set({ ...initialState, isInitialized: true })
          }

          const existingToken = storage.getItem(tokenKey)
          if (existingToken) {
            set({ accessToken: existingToken, isAuthenticated: true })
            try {
              const me = await fetchMe()
              set({ me, isInitialized: true })
            } catch {
              resetToGuest()
            }
            return
          }

          try {
            const newToken = await tryRefreshToken()
            if (!newToken) {
              markInitialized()
              return
            }

            storage.setItem(tokenKey, newToken)
            set({ accessToken: newToken, isAuthenticated: true })

            const me = await fetchMe()
            set({ me, isInitialized: true })
          } catch {
            // No valid refresh token — guest user
            markInitialized()
          }
        },
      }),
      {
        name,
        enabled:
          import.meta.env.DEV ||
          import.meta.env.VITE_NODE_ENV === 'development',
      },
    ),
  )

  return store
}

export const useAuthStore = createAuthStore({
  name: 'UserAuthStore',
  tokenKey: ACCESS_TOKEN_KEY.USER,
  refreshTokenEndpoint: REFRESH_TOKEN_ENDPOINT.USER,
  getMeService: () => AuthService.getMe(),
})

export const useAdminAuthStore = createAuthStore({
  name: 'AdminAuthStore',
  tokenKey: ACCESS_TOKEN_KEY.ADMIN,
  refreshTokenEndpoint: REFRESH_TOKEN_ENDPOINT.ADMIN,
  getMeService: () => AdminAuthService.getMe(),
})

export const authReadyPromise = Promise.all([
  useAuthStore.getState().initializeAuth(),
  useAdminAuthStore.getState().initializeAuth(),
])
