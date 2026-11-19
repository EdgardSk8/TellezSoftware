import { CURRENT_TERMS_VERSION } from '../../../../shared/terms'
import { hashPassword } from '../../../_lib/auth'
import {
  GOOGLE_TOKEN_URL,
  GOOGLE_USERINFO_URL,
  googleConfig,
  isHttpsRequest,
  oauthCookieHeader,
  readOAuthState,
  redirectTo,
} from '../../../_lib/google'
import { randomToken, secureCookie, sha256 } from '../../../_lib/http'

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

type GoogleProfile = {
  sub?: unknown
  email?: unknown
  email_verified?: unknown
}

type GoogleToken = { access_token?: unknown }

// Callback del flujo OAuth: valida state + PKCE, canjea el código, crea o
// reutiliza la cuenta y emite la sesión propia de la aplicación.
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const origin = new URL(request.url).origin
  const clearCookie = oauthCookieHeader('', 0, isHttpsRequest(request))
  const fail = (reason: string) => redirectTo(`${origin}/ingresar?google=${reason}`, [clearCookie])

  const config = googleConfig(env)
  if (!config) return fail('no_configurado')

  const url = new URL(request.url)
  const saved = readOAuthState(request)
  if (!saved) return fail('solicitud_invalida')
  if (url.searchParams.get('error')) return fail('acceso_denegado')

  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  if (!code || !state || state !== saved.state) return fail('solicitud_invalida')

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      code_verifier: saved.verifier,
      grant_type: 'authorization_code',
      redirect_uri: `${origin}/api/auth/google/callback`,
    }),
  })
  if (!tokenResponse.ok) return fail('intercambio_fallido')

  const token = (await tokenResponse.json()) as GoogleToken
  if (typeof token.access_token !== 'string') return fail('intercambio_fallido')

  const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { authorization: `Bearer ${token.access_token}` },
  })
  if (!profileResponse.ok) return fail('perfil_fallido')

  const profile = (await profileResponse.json()) as GoogleProfile
  if (typeof profile.sub !== 'string' || typeof profile.email !== 'string') return fail('perfil_fallido')
  if (profile.email_verified !== true) return fail('correo_no_verificado')

  const providerUid = profile.sub
  const email = profile.email.trim().toLowerCase()
  const now = new Date().toISOString()
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString()
  const sessionToken = randomToken()
  const tokenHash = await sha256(sessionToken)
  const sessionCookie = secureCookie(sessionToken, SESSION_TTL_SECONDS)

  const linked = await env.DB.prepare(
    'SELECT user_id FROM oauth_accounts WHERE provider = ?1 AND provider_uid = ?2 LIMIT 1',
  )
    .bind('google', providerUid)
    .first<{ user_id: string }>()

  if (linked) {
    const membership = await env.DB.prepare(`
      SELECT tenant_memberships.tenant_id
      FROM tenant_memberships
      JOIN tenants ON tenants.id = tenant_memberships.tenant_id
      WHERE tenant_memberships.user_id = ?1
      ORDER BY tenant_memberships.created_at ASC, tenants.created_at ASC, tenants.name COLLATE NOCASE ASC
      LIMIT 1
    `)
      .bind(linked.user_id)
      .first<{ tenant_id: string }>()

    if (!membership) return fail('sin_espacio')

    await env.DB.prepare(`
      INSERT INTO sessions (token_hash, user_id, tenant_id, expires_at, created_at, last_seen_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?5)
    `)
      .bind(tokenHash, linked.user_id, membership.tenant_id, expiresAt, now)
      .run()

    return redirectTo(`${origin}/`, [sessionCookie, clearCookie])
  }

  // No se fusionan cuentas automáticamente: si el correo ya existe con otro
  // método de acceso, se pide iniciar sesión con ese método.
  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?1 LIMIT 1')
    .bind(email)
    .first<{ id: string }>()
  if (existing) return fail('cuenta_existente')

  const userId = crypto.randomUUID()
  const tenantId = crypto.randomUUID()
  const slug = `negocio-${tenantId.slice(0, 12)}`
  const termsVersion = saved.termsVersion === CURRENT_TERMS_VERSION ? saved.termsVersion : null
  const passwordRecord = await hashPassword(`${randomToken()}-oauth-google`)

  try {
    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO tenants (id, name, slug, inventory_profile, business_type, currency, created_at, setup_completed, trial_started_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0, ?7)
      `).bind(tenantId, 'Cuenta nueva', slug, 'solid_goods', 'general', 'NIO', now),
      env.DB.prepare(`
        INSERT INTO users (
          id, email, email_verified, password_hash, password_salt, password_iterations,
          terms_accepted_version, terms_accepted_at, created_at
        )
        VALUES (?1, ?2, 1, ?3, ?4, ?5, ?6, ?7, ?8)
      `).bind(
        userId,
        email,
        passwordRecord.hash,
        passwordRecord.salt,
        passwordRecord.iterations,
        termsVersion,
        termsVersion ? now : null,
        now,
      ),
      env.DB.prepare(`
        INSERT INTO tenant_memberships (tenant_id, user_id, role, created_at)
        VALUES (?1, ?2, 'owner', ?3)
      `).bind(tenantId, userId, now),
      env.DB.prepare(`
        INSERT INTO sessions (token_hash, user_id, tenant_id, expires_at, created_at, last_seen_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?5)
      `).bind(tokenHash, userId, tenantId, expiresAt, now),
      env.DB.prepare(`
        INSERT INTO oauth_accounts (provider, provider_uid, user_id, created_at)
        VALUES ('google', ?1, ?2, ?3)
      `).bind(providerUid, userId, now),
    ])
  } catch (error) {
    console.error('Google sign-up failed.', error)
    return fail('alta_fallida')
  }

  return redirectTo(`${origin}/`, [sessionCookie, clearCookie])
}
