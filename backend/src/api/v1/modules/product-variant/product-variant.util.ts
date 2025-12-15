type RawAttributeValue = {
  id: number
  valueText: string
  attribute: {
    id: number
    name: string
  } | null
}

type AttributeValueDto = {
  id: number
  value: string
}

type AttributeGroupDto = {
  id: number
  name: string
  values: AttributeValueDto[]
}

export function mapAttributeValues(
  attributeValues: RawAttributeValue[],
): AttributeGroupDto[] {
  const attributeMap = new Map<number, AttributeGroupDto>()

  for (const av of attributeValues) {
    const attr = av.attribute
    if (!attr) continue

    if (!attributeMap.has(attr.id)) {
      attributeMap.set(attr.id, {
        id: attr.id,
        name: attr.name,
        values: [],
      })
    }

    attributeMap.get(attr.id)!.values.push({
      id: av.id,
      value: av.valueText,
    })
  }

  return Array.from(attributeMap.values())
}
