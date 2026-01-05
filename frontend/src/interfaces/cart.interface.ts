export interface CartItem {
  productId: number
  variantId: number
  quantity: number
  price: number // Snapshot price when added
  currentPrice: number // Current price from DB
  priceChanged: boolean
  product: {
    id: number
    name: string
    sku: string
    image: string | null
    status: string
  }
  variant: {
    id: number
    title: string | null
    sku: string
    price: number
    stockQuantity: number
    isDefault: boolean
  }
  subtotal: number
  addedAt: string
}

export interface CartSummary {
  itemCount: number
  totalQuantity: number
  subtotal: number
  hasPriceChanges: boolean
  hasOutOfStock: boolean
}

export interface Cart {
  items: CartItem[]
  summary: CartSummary
  updatedAt: string
}

export interface AddToCartInput {
  productId: number
  variantId: number
  quantity?: number
}

export interface UpdateCartItemInput {
  quantity: number
}

export interface RemoveCartItemInput {
  productId: number
  variantId: number
}
