export interface Category {
  id: number
  name: string
  slug: string
  description?: string | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}