import { consumeDummyPasswordHash, verifyPassword } from '../../_lib/auth'
import { json, isSameOrigin, randomToken, readJsonObject, secureCookie, sha256 } from '../../_lib/http'

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7
const MAX_ATTEMPTS = 8
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000

type UserPassword = {
  id: string
  email: string
  password_hash: string
  password_salt: string
  password_iterations: number
  tenant_id: string
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!isSameOrigin(request)) return json({ error: 'Solicitud de origen no permitido.' }, 403)

  const body = await readJsonObject(request)
  if (!body) return json({ error: 'Se requiere un cuerpo JSON válido de hasta 16 KB.' }, 400)
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email) || password.length < 1 || password.length > 128) {
    return json({ error: 'Correo o contraseña incorrectos.' }, 401)
  }

  const ipAddress = request.headers.get('CF-Connecting-IP') ?? 'local'
  const identityHash = await sha256(`${email}:${ipAddress}`)
  const now = new Date()
  const cutoff = new Date(now.getTime() - ATTEMPT_WINDOW_MS).toISOString()
  const attempts = await env.DB.prepare(`
    SELECT COUNT(*) AS count
    FROM login_attempts
    WHERE identity_hash = ?1 AND attempted_at > ?2
  `).bind(identityHash, cutoff).first<{ count: number }>()

  if ((attempts?.count ?? 0) >= MAX_ATTEMPTS) {
    return json({ error: 'Demasiados intentos. Espera 15 minutos antes de volver a intentarlo.' }, 429, { 'Retry-After': '900' })
  }

  const user = await env.DB.prepare(`
    SELECT users.id, users.email, users.password_hash, users.password_salt,
           users.password_iterations, tenant_memberships.tenant_id
    FROM users
    JOIN tenant_memberships ON tenant_memberships.user_id = users.id
    JOIN tenants ON tenants.id = tenant_memberships.tenant_id
    WHERE users.email = ?1
    ORDER BY tenant_memberships.created_at ASC, tenants.created_at ASC, tenants.name COLLATE NOCASE ASC
    LIMIT 1
  `).bind(email).first<UserPassword>()

  const validPassword = user
    ? await verifyPassword(password, user.password_salt, user.password_hash, user.password_iterations)
    : (await consumeDummyPasswordHash(password), false)

  if (!user || !validPassword) {
    await env.DB.batch([
      env.DB.prepare('INSERT INTO login_attempts (identity_hash, attempted_at) VALUES (?1, ?2)').bind(identityHash, now.toISOString()),
      env.DB.prepare('DELETE FROM login_attempts WHERE attempted_at < ?1').bind(new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()),
    ])
    return json({ error: 'Correo o contraseña incorrectos.' }, 401)
  }

  const tenantId = user.tenant_id
  const sessionToken = randomToken()
  const tokenHash = await sha256(sessionToken)
  const createdAt = new Date().toISOString()
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString()
  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO sessions (token_hash, user_id, tenant_id, expires_at, created_at, last_seen_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?5)
    `).bind(tokenHash, user.id, tenantId, expiresAt, createdAt),
    env.DB.prepare('DELETE FROM login_attempts WHERE identity_hash = ?1').bind(identityHash),
  ])

  return json({ user: { id: user.id, email: user.email }, tenantId }, 200, {
    'Set-Cookie': secureCookie(sessionToken, SESSION_TTL_SECONDS),
  })
}
