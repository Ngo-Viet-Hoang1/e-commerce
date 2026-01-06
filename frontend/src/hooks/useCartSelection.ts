import { useState, useMemo, useCallback } from 'react'
import type { Cart } from '@/interfaces/cart.interface'

export function useCartSelection(cart: Cart | undefined) {
  const getItemId = useCallback(
    (productId: number, variantId: number) => `${productId}-${variantId}`,
    [],
  )

  const validItemIds = useMemo(() => {
    if (!cart?.items) return []
    return cart.items
      .filter((item) => item.variant.stockQuantity > 0)
      .map((item) => getItemId(item.productId, item.variantId))
  }, [cart, getItemId])

  const [selectedIds, setSelectedIds] = useState<Set<string> | null>(null)

  const syncedSelectedIds = useMemo(() => {
    const validIdsSet = new Set(validItemIds)

    if (validItemIds.length === 0) return new Set<string>()

    if (selectedIds === null) return validIdsSet

    const synced = new Set<string>()
    selectedIds.forEach((id) => {
      if (validIdsSet.has(id)) {
        synced.add(id)
      }
    })

    return synced
  }, [validItemIds, selectedIds])

  const toggleItem = useCallback((productId: number, variantId: number) => {
    const itemId = `${productId}-${variantId}`
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(new Set(validItemIds))
      } else {
        setSelectedIds(new Set())
      }
    },
    [validItemIds],
  )

  const isAllSelected = useMemo(() => {
    if (validItemIds.length === 0) return false
    return validItemIds.every((id) => syncedSelectedIds.has(id))
  }, [validItemIds, syncedSelectedIds])

  const selectedSummary = useMemo(() => {
    if (!cart) return { items: [], count: 0, subtotal: 0, hasIssues: false }

    const selectedItems = cart.items.filter((item) =>
      syncedSelectedIds.has(getItemId(item.productId, item.variantId)),
    )

    const subtotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0)
    const hasIssues = selectedItems.some(
      (item) =>
        item.variant.stockQuantity === 0 ||
        item.quantity > item.variant.stockQuantity,
    )

    return {
      items: selectedItems,
      count: selectedItems.length,
      subtotal,
      hasIssues,
    }
  }, [cart, syncedSelectedIds, getItemId])

  return {
    selectedIds: syncedSelectedIds,
    selectedSummary,
    isAllSelected,
    toggleItem,
    selectAll,
    getItemId,
  }
}
