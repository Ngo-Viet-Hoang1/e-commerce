export interface Brand {
  id: number
  name: string
  description?: string | null
  logoUrl?: string | null
  website?: string | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
