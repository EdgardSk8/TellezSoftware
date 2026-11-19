export const BUSINESS_TYPES = [
  'clothing',
  'hardware',
  'food',
  'general',
] as const

export type SelectableBusinessType = typeof BUSINESS_TYPES[number]
export type BusinessType = SelectableBusinessType | 'electronics' | 'auto_parts' | 'liquor' | 'personal'

export function isBusinessType(value: unknown): value is BusinessType {
  return typeof value === 'string'
    && ['clothing', 'hardware', 'food', 'general', 'electronics', 'auto_parts', 'liquor', 'personal'].includes(value)
}

export function isSelectableBusinessType(value: unknown): value is SelectableBusinessType {
  return typeof value === 'string' && BUSINESS_TYPES.some((businessType) => businessType === value)
}

export function businessGroupForType(businessType: BusinessType): SelectableBusinessType {
  switch (businessType) {
    case 'auto_parts':
      return 'hardware'
    case 'liquor':
      return 'food'
    case 'electronics':
    case 'personal':
      return 'general'
    default:
      return businessType
  }
}

export function inventoryProfileForBusinessType(businessType: BusinessType): string {
  switch (businessType) {
    case 'clothing':
      return 'clothing'
    case 'hardware':
      return 'hardware'
    case 'personal':
      return 'personal'
    default:
      return 'solid_goods'
  }
}
