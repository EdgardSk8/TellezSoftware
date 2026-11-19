import { getCookie } from './http'

export const OAUTH_COOKIE = 'tellez_oauth'
export const OAUTH_COOKIE_PATH = '/api/auth/google'
export const OAUTH_STATE_TTL_SECONDS = 600
export const GOOGLE_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
export const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo'

export type GoogleConfig = { clientId: string; clientSecret: string }

export type OAuthState = {
  state: string
  verifier: string
  termsVersion: string | null
}

export function googleConfig(env: Env): GoogleConfig | null {
  const clientId = env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = env.GOOGLE_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) return null
  return { clientId, clientSecret }
}

export function base64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '')
}

export function randomUrlToken(byteLength = 32): string {
  return base64Url(crypto.getRandomValues(new Uint8Array(byteLength)))
}

export async function codeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return base64Url(new Uint8Array(digest))
}

export function isHttpsRequest(request: Request): boolean {
  return new URL(request.url).protocol === 'https:'
}

export function oauthCookieHeader(value: string, maxAge: number, secure: boolean): string {
  const attributes = [`${OAUTH_COOKIE}=${value}`, `Path=${OAUTH_COOKIE_PATH}`, 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAge}`]
  if (secure) attributes.push('Secure')
  return attributes.join('; ')
}

export function readOAuthState(request: Request): OAuthState | null {
  const raw = getCookie(request, OAUTH_COOKIE)
  if (!raw) return null

  try {
    const value: unknown = JSON.parse(raw)
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null

    const record = value as Record<string, unknown>
    if (typeof record.state !== 'string' || typeof record.verifier !== 'string') return null

    return {
      state: record.state,
      verifier: record.verifier,
      termsVersion: typeof record.termsVersion === 'string' ? record.termsVersion : null,
    }
  } catch {
    return null
  }
}

export function redirectTo(location: string, cookies: string[] = [], status = 302): Response {
  const headers = new Headers({
    Location: location,
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
  })
  for (const cookie of cookies) headers.append('Set-Cookie', cookie)
  return new Response(null, { status, headers })
}
