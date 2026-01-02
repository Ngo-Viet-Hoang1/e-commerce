export interface Me {
  roles: string[]
  perms: string[]
  name: string | null
  id: number
  email: string
  googleId: string | null
  phoneNumber: string | null
  emailVerified: boolean
  lastLoginAt: Date | null
  isActive: boolean
  isMfaActive: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface AuthState {
  me: Me | null
  accessToken: string | null
  // isAdmin: boolean // Optional: if you want to differentiate between admin and user
  isAuthenticated: boolean
  isInitialized: boolean
}

export interface AuthActions {
  setMe: (user: Me | null) => void
  setAccessToken: (token: string | null) => void
  reset: () => void
  initializeAuth: () => Promise<void>
}
