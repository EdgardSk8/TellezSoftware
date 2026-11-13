import { getCookie, fromHex, sha256, toHex } from './http'

const SESSION_COOKIE = '__Host-tellez-session'
const PASSWORD_ITERATIONS = 310_000
const DUMMY_SALT = '8e94c02a5173f14109891a2d9f36ccab'

export type AuthenticatedSession = {
  userId: string
  tenantId: string
  tenantName: string
  profile: string
  currency: string
  role: string
  email: string
  emailVerified: number
}

export type PasswordRecord = {
  hash: string
  salt: string
  iterations: number
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE
}

export async function hashPassword(password: string): Promise<PasswordRecord> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await derivePassword(password, salt, PASSWORD_ITERATIONS)
  return { hash: toHex(hash), salt: toHex(salt), iterations: PASSWORD_ITERATIONS }
}

export async function verifyPassword(password: string, saltHex: string, expectedHash: string, iterations: number): Promise<boolean> {
  const salt = fromHex(saltHex)
  const actual = await derivePassword(password, salt, iterations)
  const expected = fromHex(expectedHash)
  if (actual.length !== expected.length) return false

  let difference = 0
  for (let index = 0; index < actual.length; index += 1) difference |= actual[index] ^ expected[index]
  return difference === 0
}

export async function consumeDummyPasswordHash(password: string): Promise<void> {
  await derivePassword(password, fromHex(DUMMY_SALT), PASSWORD_ITERATIONS)
}

async function derivePassword(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const saltBuffer = new ArrayBuffer(salt.byteLength)
  new Uint8Array(saltBuffer).set(salt)
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: saltBuffer, iterations }, key, 256)
  return new Uint8Array(bits)
}

export async function getAuthenticatedSession(request: Request, db: D1Database): Promise<AuthenticatedSession | null> {
  const token = getCookie(request, SESSION_COOKIE)
  if (!token || !/^[A-Za-z0-9_-]{40,50}$/u.test(token)) return null

  const tokenHash = await sha256(token)
  const now = new Date().toISOString()
  return db.prepare(`
    SELECT users.id AS userId, users.email, users.email_verified AS emailVerified,
           tenants.id AS tenantId,
           tenants.name AS tenantName, tenants.inventory_profile AS profile,
           tenants.currency, tenant_memberships.role
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    JOIN tenants ON tenants.id = sessions.tenant_id
    JOIN tenant_memberships
      ON tenant_memberships.tenant_id = sessions.tenant_id
     AND tenant_memberships.user_id = sessions.user_id
    WHERE sessions.token_hash = ?1 AND sessions.expires_at > ?2
    LIMIT 1
  `).bind(tokenHash, now).first<AuthenticatedSession>()
}
