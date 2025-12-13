import AuthService from '@/api/services/user/auth.service'
import { ACCESS_TOKEN_KEY } from '@/constants'
import type { AuthActions, AuthState } from '@/interfaces/auth.interface'
import { storage } from '@/utils/localstorage.util'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface CreateAuthStoreProps {
  name: string
  tokenKey: string
}

export type AuthStore = AuthState & AuthActions

const createAuthStore = ({ name, tokenKey }: CreateAuthStoreProps) => {
  const initialState: AuthState = {
    me: null,
    accessToken: null,
    isAuthenticated: false,
    isInitialized: false,
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
          if (get().isInitialized) {
            return
          }

          const token = storage.getItem(tokenKey)

          if (token) {
            set({
              accessToken: token,
              isAuthenticated: true,
            })

            try {
              const { success, data } = await AuthService.getMe()
              if (success && data?.me) {
                set({ me: data.me, isInitialized: true })
              } else {
                throw new Error('Failed to fetch user')
              }
            } catch {
              storage.removeItem(tokenKey)
              set({
                accessToken: null,
                isAuthenticated: false,
                me: null,
                isInitialized: true,
              })
            }
          } else {
            set({ isInitialized: true })
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
})

export const useAdminAuthStore = createAuthStore({
  name: 'AdminAuthStore',
  tokenKey: ACCESS_TOKEN_KEY.ADMIN,
})
