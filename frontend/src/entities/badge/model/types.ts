export interface Badge {
  id: number
  code: string
  name: string
  description?: string | null
  iconUrl?: string | null
  criteria?: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
