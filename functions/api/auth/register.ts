import { hashPassword } from '../../_lib/auth'
import { json, isSameOrigin, randomToken, readJsonObject, secureCookie, sha256 } from '../../_lib/http'

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7
const profiles = new Set(['clothing', 'hardware', 'solid_goods', 'personal'])
const reservedSlugs = new Set([
  'admin', 'api', 'catalogo', 'catalog', 'login', 'registro', 'register',
  'dashboard', 'configuracion', 'settings', 'producto', 'products',
])

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!isSameOrigin(request)) return json({ error: 'Solicitud de origen no permitido.' }, 403)

  const body = await readJsonObject(request)
  if (!body) return json({ error: 'Se requiere un cuerpo JSON válido de hasta 16 KB.' }, 400)

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const tenantName = typeof body.tenantName === 'string' ? body.tenantName.trim() : ''
  const profile = typeof body.profile === 'string' ? body.profile : ''
  const currency = typeof body.currency === 'string' ? body.currency.trim().toUpperCase() : 'NIO'

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
    return json({ error: 'Ingresa un correo electrónico válido.' }, 400)
  }
  if (password.length < 12 || password.length > 128) {
    return json({ error: 'La contraseña debe tener entre 12 y 128 caracteres.' }, 400)
  }
  if (tenantName.length < 2 || tenantName.length > 100) {
    return json({ error: 'El nombre del negocio debe tener entre 2 y 100 caracteres.' }, 400)
  }
  if (!profiles.has(profile)) return json({ error: 'Selecciona un perfil de inventario válido.' }, 400)
  if (!/^[A-Z]{3}$/u.test(currency)) return json({ error: 'La moneda debe ser un código de tres letras.' }, 400)

  const existingUser = await env.DB.prepare('SELECT id FROM users WHERE email = ?1 LIMIT 1')
    .bind(email).first<{ id: string }>()
  if (existingUser) return json({ error: 'No se pudo crear la cuenta con esos datos.' }, 409)

  const now = new Date().toISOString()
  const userId = crypto.randomUUID()
  const tenantId = crypto.randomUUID()
  const sessionToken = randomToken()
  const tokenHash = await sha256(sessionToken)
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString()
  const passwordRecord = await hashPassword(password)
  const baseSlug = tenantName.normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '')
    .slice(0, 40) || 'tienda'
  const slug = reservedSlugs.has(baseSlug) ? `negocio-${baseSlug}-${tenantId.slice(0, 6)}` : `${baseSlug}-${tenantId.slice(0, 6)}`

  try {
    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO tenants (id, name, slug, inventory_profile, currency, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
      `).bind(tenantId, tenantName, slug, profile, currency, now),
      env.DB.prepare(`
        INSERT INTO users (id, email, password_hash, password_salt, password_iterations, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
      `).bind(userId, email, passwordRecord.hash, passwordRecord.salt, passwordRecord.iterations, now),
      env.DB.prepare(`
        INSERT INTO tenant_memberships (tenant_id, user_id, role, created_at)
        VALUES (?1, ?2, 'owner', ?3)
      `).bind(tenantId, userId, now),
      env.DB.prepare(`
        INSERT INTO sessions (token_hash, user_id, tenant_id, expires_at, created_at, last_seen_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?5)
      `).bind(tokenHash, userId, tenantId, expiresAt, now),
    ])
  } catch (error) {
    console.error('Tenant registration failed.', error)
    return json({ error: 'No se pudo completar el registro. Inténtalo de nuevo.' }, 500)
  }

  return json({
    user: { id: userId, email, emailVerified: false },
    tenant: { id: tenantId, name: tenantName, slug, profile, currency },
  }, 201, { 'Set-Cookie': secureCookie(sessionToken, SESSION_TTL_SECONDS) })
}
