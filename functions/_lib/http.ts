export function json(data: unknown, status = 200, extraHeaders?: HeadersInit): Response {
  const headers = new Headers(extraHeaders)
  headers.set('Content-Type', 'application/json; charset=utf-8')
  headers.set('Cache-Control', 'no-store')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Referrer-Policy', 'no-referrer')
  return new Response(JSON.stringify(data), { status, headers })
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  const contentLength = Number(request.headers.get('Content-Length') ?? 0)
  if (contentLength > 16_384) return null

  const contentType = request.headers.get('Content-Type') ?? ''
  if (!contentType.toLowerCase().startsWith('application/json')) return null

  const body = await request.arrayBuffer()
  if (body.byteLength > 16_384) return null

  try {
    const value: unknown = JSON.parse(new TextDecoder().decode(body))
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null
    return value as Record<string, unknown>
  } catch {
    return null
  }
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin')
  if (!origin) return false

  try {
    return new URL(origin).origin === new URL(request.url).origin
  } catch {
    return false
  }
}

export function secureCookie(value: string, maxAge: number): string {
  return `__Host-tellez-session=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`
}

export function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('Cookie')
  if (!cookieHeader) return null

  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=')
    if (separator < 0 || part.slice(0, separator).trim() !== name) continue
    return part.slice(separator + 1).trim()
  }
  return null
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function fromHex(value: string): Uint8Array {
  if (!/^(?:[0-9a-f]{2})+$/i.test(value)) throw new Error('Invalid hexadecimal data')
  const bytes = new Uint8Array(value.length / 2)
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16)
  }
  return bytes
}

export function randomToken(byteLength = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength))
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '')
}

export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return toHex(new Uint8Array(digest))
}
