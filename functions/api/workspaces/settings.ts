import { getAuthenticatedSession } from '../../_lib/auth'
import { isSameOrigin, json, readJsonObject } from '../../_lib/http'
import { inventoryProfileForBusinessType, isSelectableBusinessType } from '../../../shared/business-types'

export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  if (!isSameOrigin(request)) return json({ error: 'Solicitud de origen no permitido.' }, 403)
  const session = await getAuthenticatedSession(request, env.DB)
  if (!session) return json({ error: 'Inicia sesión para continuar.' }, 401)
  if (session.role !== 'owner') return json({ error: 'Solo el propietario puede configurar esta cuenta.' }, 403)

  const body = await readJsonObject(request)
  if (!body) return json({ error: 'Se requiere un cuerpo JSON válido de hasta 16 KB.' }, 400)

  const businessType = body.businessType
  const currency = typeof body.currency === 'string' ? body.currency.trim().toUpperCase() : ''
  if (!isSelectableBusinessType(businessType)) return json({ error: 'Selecciona un tipo de negocio válido.' }, 400)
  if (!['NIO', 'USD'].includes(currency) && currency !== session.currency) {
    return json({ error: 'Selecciona una moneda disponible.' }, 400)
  }

  const currentTenant = await env.DB.prepare('SELECT currency FROM tenants WHERE id = ?1 LIMIT 1')
    .bind(session.tenantId).first<{ currency: string }>()
  if (!currentTenant) return json({ error: 'No se encontró el negocio de esta sesión.' }, 404)

  const result = await env.DB.prepare(`
    UPDATE tenants
    SET business_type = ?1, inventory_profile = ?2, currency = ?3
    WHERE id = ?4
      AND (?3 = currency OR NOT EXISTS (
        SELECT 1 FROM products WHERE products.tenant_id = tenants.id
      ))
      AND EXISTS (
        SELECT 1 FROM tenant_memberships
        WHERE tenant_memberships.tenant_id = tenants.id
          AND tenant_memberships.user_id = ?5
          AND tenant_memberships.role = 'owner'
      )
  `).bind(
    businessType,
    inventoryProfileForBusinessType(businessType),
    currency,
    session.tenantId,
    session.userId,
  ).run()

  if (result.meta.changes !== 1) {
    if (currency !== currentTenant.currency) {
      return json({ error: 'No se puede cambiar la moneda después de registrar productos, porque alteraría cómo se interpretan sus precios.' }, 409)
    }
    return json({ error: 'No se pudo guardar la configuración de esta cuenta.' }, 409)
  }

  return json({ businessType, currency })
}
