import { getAuthenticatedSession } from '../../_lib/auth'
import { isSameOrigin, json } from '../../_lib/http'
import {
  BUSINESS_TYPES,
  businessGroupForType,
  inventoryProfileForBusinessType,
  type SelectableBusinessType,
} from '../../../shared/business-types'

const businessLabels: Record<SelectableBusinessType, string> = {
  clothing: 'Ropa y calzado',
  hardware: 'Ferretería y repuestos',
  food: 'Alimentos y bebidas',
  general: 'Tienda general',
}

function slugify(value: string): string {
  return value.normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '')
    .slice(0, 40) || 'negocio'
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!isSameOrigin(request)) return json({ error: 'Solicitud de origen no permitido.' }, 403)
  const session = await getAuthenticatedSession(request, env.DB)
  if (!session) return json({ error: 'Inicia sesión para continuar.' }, 401)
  if (session.role !== 'owner') return json({ error: 'Solo el propietario puede preparar los negocios.' }, 403)

  const existing = await env.DB.prepare(`
    SELECT tenants.business_type AS businessType, tenants.inventory_profile AS profile
    FROM tenant_memberships
    JOIN tenants ON tenants.id = tenant_memberships.tenant_id
    WHERE tenant_memberships.user_id = ?1
  `).bind(session.userId).all<{ businessType: string | null; profile: string }>()

  const existingTypes = new Set(existing.results.map(({ businessType, profile }) => {
    if (businessType === 'clothing' || businessType === 'hardware' || businessType === 'food'
      || businessType === 'general' || businessType === 'electronics' || businessType === 'auto_parts'
      || businessType === 'liquor' || businessType === 'personal') {
      return businessGroupForType(businessType)
    }
    return profile === 'clothing' || profile === 'hardware' ? profile : 'general'
  }))
  const missingTypes = BUSINESS_TYPES.filter((businessType) => !existingTypes.has(businessType))
  if (missingTypes.length === 0) return json({ created: 0 })

  const now = new Date().toISOString()
  const statements = missingTypes.flatMap((businessType) => {
    const tenantId = crypto.randomUUID()
    const slug = `${slugify(`${session.tenantName}-${businessLabels[businessType]}`)}-${tenantId.slice(0, 6)}`
    const tenantName = `${session.tenantName} - ${businessLabels[businessType]}`.slice(0, 100)
    return [
      env.DB.prepare(`
        INSERT INTO tenants (id, name, slug, inventory_profile, business_type, currency, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
      `).bind(
        tenantId,
        tenantName,
        slug,
        inventoryProfileForBusinessType(businessType),
        businessType,
        session.currency,
        now,
      ),
      env.DB.prepare(`
        INSERT INTO tenant_memberships (tenant_id, user_id, role, created_at)
        VALUES (?1, ?2, 'owner', ?3)
      `).bind(tenantId, session.userId, now),
    ]
  })

  try {
    await env.DB.batch(statements)
  } catch (error) {
    console.error('Business workspace initialization failed.', error)
    return json({ error: 'No se pudieron preparar los negocios. Inténtalo de nuevo.' }, 500)
  }

  return json({ created: missingTypes.length })
}
