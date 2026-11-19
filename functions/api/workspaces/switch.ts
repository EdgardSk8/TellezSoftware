import { getCookie, isSameOrigin, json, readJsonObject, sha256 } from '../../_lib/http'
import { getAuthenticatedSession, getSessionCookieName } from '../../_lib/auth'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!isSameOrigin(request)) return json({ error: 'Solicitud de origen no permitido.' }, 403)
  const session = await getAuthenticatedSession(request, env.DB)
  if (!session) return json({ error: 'Inicia sesión para continuar.' }, 401)

  const body = await readJsonObject(request)
  if (!body || typeof body.workspaceId !== 'string' || !/^[\da-f-]{36}$/iu.test(body.workspaceId)) {
    return json({ error: 'Selecciona un negocio válido.' }, 400)
  }

  const token = getCookie(request, getSessionCookieName())
  if (!token) return json({ error: 'La sesión ya no es válida. Inicia sesión de nuevo.' }, 401)
  const tokenHash = await sha256(token)
  const result = await env.DB.prepare(`
    UPDATE sessions
    SET tenant_id = ?1, last_seen_at = ?2
    WHERE token_hash = ?3 AND user_id = ?4
      AND EXISTS (
        SELECT 1 FROM tenant_memberships
        WHERE tenant_id = ?1 AND user_id = ?4
      )
  `).bind(body.workspaceId, new Date().toISOString(), tokenHash, session.userId).run()

  if (result.meta.changes !== 1) return json({ error: 'No tienes acceso a ese negocio.' }, 403)
  return json({ tenantId: body.workspaceId })
}
