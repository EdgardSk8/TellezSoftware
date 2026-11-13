import { getCookie, isSameOrigin, json, secureCookie, sha256 } from '../../_lib/http'
import { getSessionCookieName } from '../../_lib/auth'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!isSameOrigin(request)) return json({ error: 'Solicitud de origen no permitido.' }, 403)

  const token = getCookie(request, getSessionCookieName())
  if (token) {
    const tokenHash = await sha256(token)
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?1').bind(tokenHash).run()
  }

  return json({ success: true }, 200, { 'Set-Cookie': secureCookie('', 0) })
}
