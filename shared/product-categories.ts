import { type BusinessType } from './business-types.ts'

export type ProductKind = 'clothing' | 'beverages' | 'food' | 'electronics' | 'auto_parts' | 'hardware' | 'general'

export function productKindForCategory(category: string, businessType: BusinessType): ProductKind {
  const normalized = category.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

  if (/bebida|licor|vino|cerveza|ron|whisky|vodka|tequila|refresco|jugo|agua|botella|beverage|drink|liquor|wine|beer|bottle/u.test(normalized)) {
    return 'beverages'
  }
  if (/ropa|camisa|pantalon|vestido|calzado|zapato|textil|uniforme|clothing|apparel|footwear|shirt|pants|dress/u.test(normalized)) return 'clothing'
  if (/alimento|grano|fruta|verdura|carne|comida|lacteo|abarrote|food|grain|fruit|vegetable|meat/u.test(normalized)) return 'food'
  if (/electron|tecnolog|celular|telefono|computador|laptop|tablet|cargador|electronic|technology|phone|computer|charger/u.test(normalized)) return 'electronics'
  if (/repuesto|freno|motor|vehiculo|automotriz|llanta|auto part|brake|engine|vehicle|tire/u.test(normalized)) return 'auto_parts'
  if (/herramienta|material|construccion|tornillo|pintura|ferreteria|hardware|tool|building material|screw|paint/u.test(normalized)) return 'hardware'
  if (/hogar|oficina|accesorio|general|varios|otros|home|household|office|accessor|miscellaneous|other/u.test(normalized)) return 'general'

  switch (businessType) {
    case 'clothing':
      return 'clothing'
    case 'hardware':
    case 'auto_parts':
      return 'hardware'
    case 'food':
      return 'food'
    case 'liquor':
      return 'beverages'
    case 'electronics':
      return 'electronics'
    case 'general':
    case 'personal':
      return 'general'
  }
}
