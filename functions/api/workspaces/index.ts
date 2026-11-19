import { getAuthenticatedSession } from '../../_lib/auth'
import { json } from '../../_lib/http'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const session = await getAuthenticatedSession(request, env.DB)
  if (!session) return json({ error: 'Inicia sesión para continuar.' }, 401)

  const result = await env.DB.prepare(`
    SELECT tenants.id, tenants.name, tenants.slug,
           tenants.inventory_profile AS profile,
           COALESCE(tenants.business_type, CASE tenants.inventory_profile
             WHEN 'clothing' THEN 'clothing'
             WHEN 'hardware' THEN 'hardware'
             WHEN 'personal' THEN 'personal'
             ELSE 'general'
           END) AS businessType,
           tenants.currency, tenants.setup_completed AS setupCompleted, tenant_memberships.role
    FROM tenant_memberships
    JOIN tenants ON tenants.id = tenant_memberships.tenant_id
    WHERE tenant_memberships.user_id = ?1
    ORDER BY tenant_memberships.created_at ASC, tenants.name COLLATE NOCASE ASC
  `).bind(session.userId).all<{
    id: string
    name: string
    slug: string
    profile: string
    businessType: string
    currency: string
    setupCompleted: number
    role: string
  }>()

  return json({ items: result.results })
}
