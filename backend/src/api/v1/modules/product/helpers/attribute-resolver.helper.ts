import type { PrismaClient } from '@generated/prisma/client'
import type { CreateSimpleProductBody } from '../product.schema'

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>

interface AttributeWithValues {
  id: number
  name: string
  inputType: string | null
  isFilterable: boolean
  isSearchable: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  values: Array<{
    id: number
    attributeId: number
    valueText: string
    valueMeta: unknown
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
  }>
}

export interface AttributeResolutionResult {
  attributeMap: Map<string, AttributeWithValues>
  attributeValueMap: Map<string, number>
}

export class AttributeResolver {
  static extractAttributeData = (
    variants: CreateSimpleProductBody['variants'],
  ): {
    allAttributeNames: Set<string>
    allAttributeData: Map<string, Set<string>>
  } => {
    const allAttributeNames = new Set<string>()
    const allAttributeData = new Map<string, Set<string>>()

    for (const variant of variants) {
      if (variant.attributes && variant.attributes.length > 0) {
        for (const attr of variant.attributes) {
          const normalizedName = attr.attributeName.trim().toLowerCase()
          allAttributeNames.add(normalizedName)

          if (!allAttributeData.has(normalizedName)) {
            allAttributeData.set(normalizedName, new Set())
          }
          allAttributeData.get(normalizedName)!.add(attr.value.trim())
        }
      }
    }

    return { allAttributeNames, allAttributeData }
  }

  static ensureAttributesExist = async (
    tx: TransactionClient,
    allAttributeNames: Set<string>,
    variants: CreateSimpleProductBody['variants'],
  ): Promise<Map<string, AttributeWithValues>> => {
    const existingAttributes = await tx.attribute.findMany({
      where: {
        name: { in: Array.from(allAttributeNames), mode: 'insensitive' },
        deletedAt: null,
      },
      include: {
        values: {
          where: { deletedAt: null },
        },
      },
    })

    // Create lookup map
    const attributeMap = new Map<string, AttributeWithValues>()
    existingAttributes.forEach((attr) => {
      attributeMap.set(attr.name.toLowerCase(), attr)
    })

    const attributesToCreate = Array.from(allAttributeNames)
      .filter((name) => !attributeMap.has(name))
      .map((name) => ({
        name:
          variants
            .flatMap((v) => v.attributes || [])
            .find((a) => a.attributeName.trim().toLowerCase() === name)
            ?.attributeName.trim() || name, // Preserve original casing
        inputType: 'text',
        isFilterable: true,
        isSearchable: false,
      }))

    // Create missing attributes
    if (attributesToCreate.length > 0) {
      const newAttributes = await tx.attribute.createManyAndReturn({
        data: attributesToCreate,
      })

      newAttributes.forEach((attr) => {
        attributeMap.set(attr.name.toLowerCase(), { ...attr, values: [] })
      })
    }

    return attributeMap
  }

  // Creates missing attribute values in database
  static ensureAttributeValuesExist = async (
    tx: TransactionClient,
    attributeMap: Map<string, AttributeWithValues>,
    allAttributeData: Map<string, Set<string>>,
  ): Promise<void> => {
    const attributeValuesToCreate: Array<{
      attributeId: number
      valueText: string
    }> = []

    for (const [attrName, values] of allAttributeData.entries()) {
      const attribute = attributeMap.get(attrName)
      if (!attribute) continue

      const existingValues = new Set(
        attribute.values.map((v) => v.valueText.toLowerCase()),
      )

      for (const value of values) {
        if (!existingValues.has(value.toLowerCase())) {
          attributeValuesToCreate.push({
            attributeId: attribute.id,
            valueText: value,
          })
        }
      }
    }

    if (attributeValuesToCreate.length > 0) {
      await tx.attributeValue.createMany({
        data: attributeValuesToCreate,
        skipDuplicates: true,
      })
    }
  }

  // Builds a lookup map from "attributeName|value" to attributeValueId
  static buildAttributeValueMap = async (
    tx: TransactionClient,
    attributeMap: Map<string, AttributeWithValues>,
  ): Promise<Map<string, number>> => {
    const allAttributeValues = await tx.attributeValue.findMany({
      where: {
        attributeId: {
          in: Array.from(attributeMap.values()).map((a) => a.id),
        },
        deletedAt: null,
      },
    })

    // Build lookup map: "color|red" → attributeValueId
    const attributeValueMap = new Map<string, number>()
    allAttributeValues.forEach((av) => {
      const attribute = Array.from(attributeMap.values()).find(
        (a) => a.id === av.attributeId,
      )
      if (attribute) {
        const key = `${attribute.name.toLowerCase()}|${av.valueText.toLowerCase()}`
        attributeValueMap.set(key, av.id)
      }
    })

    return attributeValueMap
  }

  /**
   * Main method: Resolves all attributes and values needed for variants
   * Returns maps for looking up attribute value IDs
   */
  static resolveAttributes = async (
    tx: TransactionClient,
    variants: CreateSimpleProductBody['variants'],
  ): Promise<AttributeResolutionResult> => {
    // 1. Extract attribute data from variants
    const { allAttributeNames, allAttributeData } =
      this.extractAttributeData(variants)

    // If no attributes, return empty maps
    if (allAttributeNames.size === 0) {
      return {
        attributeMap: new Map(),
        attributeValueMap: new Map(),
      }
    }

    // 2. Ensure all attributes exist (create missing ones)
    const attributeMap = await this.ensureAttributesExist(
      tx,
      allAttributeNames,
      variants,
    )

    // 3. Ensure all attribute values exist (create missing ones)
    await this.ensureAttributeValuesExist(tx, attributeMap, allAttributeData)

    // 4. Build lookup map for attribute values
    const attributeValueMap = await this.buildAttributeValueMap(
      tx,
      attributeMap,
    )

    return { attributeMap, attributeValueMap }
  }
}

export default AttributeResolver
