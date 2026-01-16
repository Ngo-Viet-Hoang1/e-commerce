import type {
  Attribute,
  Product,
  ProductVariant,
  SelectedAttributes,
} from '@/interfaces/product.interface'
import { useMemo, useState } from 'react'

interface UseProductVariantsReturn {
  attributes: Attribute[]
  selectedAttrs: SelectedAttributes
  setSelectedAttrs: React.Dispatch<React.SetStateAction<SelectedAttributes>>
  selectedVariant: ProductVariant | undefined
  isOptionDisabled: (attributeName: string, value: string) => boolean
}

export function useProductVariants(
  product?: Product,
): UseProductVariantsReturn {
  const variants = useMemo(() => product?.variants ?? [], [product?.variants])

  /**
   * Initialize default selected attributes from default variant
   */
  const [selectedAttrs, setSelectedAttrs] = useState<SelectedAttributes>(() => {
    const defaultVariant = variants.find((v) => v.isDefault)
    if (!defaultVariant?.attributeValues) return {}

    return Object.fromEntries(
      defaultVariant.attributeValues.map((av) => [
        av.attribute?.name ?? '',
        av.valueText,
      ]),
    )
  })

  /**
   * Build list of all available attributes and their values
   * Example: [{ name: "Màu sắc", values: ["Đỏ", "Xanh"] }, ...]
   */
  const attributes = useMemo<Attribute[]>(() => {
    const map = new Map<string, Set<string>>()

    variants.forEach((variant) => {
      variant.attributeValues?.forEach((av) => {
        const attrName = av.attribute?.name
        if (!attrName) return

        if (!map.has(attrName)) {
          map.set(attrName, new Set())
        }
        map.get(attrName)!.add(av.valueText)
      })
    })

    return Array.from(map.entries()).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }))
  }, [variants])

  /**
   * Find the currently selected variant based on selected attributes
   */
  const selectedVariant = useMemo<ProductVariant | undefined>(() => {
    if (!variants.length) return undefined

    return variants.find((variant) =>
      variant.attributeValues?.every(
        (av) => selectedAttrs[av.attribute?.name ?? ''] === av.valueText,
      ),
    )
  }, [variants, selectedAttrs])

  /**
   * Check if an attribute option should be disabled
   * Disabled when no variant exists with that option + current selections
   */
  const isOptionDisabled = (attributeName: string, value: string): boolean => {
    for (const variant of variants) {
      const isMatch = variant.attributeValues?.every((av) => {
        const name = av.attribute?.name
        if (!name) return true

        if (name === attributeName) {
          return av.valueText === value
        }

        if (selectedAttrs[name] === undefined) {
          return true
        }

        return selectedAttrs[name] === av.valueText
      })

      if (isMatch) return false
    }

    return true
  }

  return {
    attributes,
    selectedAttrs,
    setSelectedAttrs,
    selectedVariant,
    isOptionDisabled,
  }
}
