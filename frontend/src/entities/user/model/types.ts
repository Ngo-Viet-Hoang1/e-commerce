export interface User {
  id: number
  email: string
  password: string
  googleId: string | null
  name: string | null
  phoneNumber: string | null
  emailVerified: boolean
  lastLoginAt: Date | null
  isActive: boolean
  isMfaActive: boolean
  twoFactorSecret: string | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface UpdateUserPayload {
  name?: string
  phoneNumber?: string
}
