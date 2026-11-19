# Guía genérica: inicio de sesión y registro con Google en Cloudflare

> Guía independiente de proyecto. No contiene datos, dominios ni credenciales reales.
> Sustituye los marcadores de la tabla siguiente por los valores de tu aplicación.

## Marcadores a reemplazar

| Marcador | Significado | Ejemplo |
|---|---|---|
| `mi-app` | Nombre del Worker | `mi-app` |
| `tudominio.com` | Dominio de producción | `app.ejemplo.com` |
| `tu-equipo` | Team name de Cloudflare Zero Trust | `acme` |
| `TU_CLIENT_ID` | Client ID de Google | `1234567890-abc.apps.googleusercontent.com` |
| `TU_CLIENT_SECRET` | Client Secret de Google | Valor secreto, nunca en el repositorio |
| `DEV_URL` | URL local del Worker | `http://localhost:8787` |
| `<database_id>` | ID de la base D1 | UUID que devuelve Cloudflare |

---

## Índice

1. [Elige el camino](#1-elige-el-camino)
2. [Ruta A: Cloudflare Access + Google](#2-ruta-a-cloudflare-access--google-sin-código)
3. [Ruta B: OAuth propio en un Worker](#3-ruta-b-oauth-propio-en-un-worker-app-pública)
4. [Alta de cuenta y onboarding](#4-alta-de-cuenta-y-onboarding)
5. [Sesiones y limpieza](#5-sesiones-y-limpieza)
6. [Checklist de seguridad](#6-checklist-de-seguridad)
7. [Errores típicos](#7-errores-típicos)
8. [Pruebas mínimas](#8-pruebas-mínimas)
9. [Referencias](#9-referencias)

---

## 1. Elige el camino

| Caso | Solución recomendada | ¿Creas cuentas propias? |
|---|---|---|
| App interna (panel, equipo, admin) | **Cloudflare Access** + Google como IdP | No: Google gestiona las identidades |
| App pública con usuarios y datos propios | **OAuth 2.0 / OIDC de Google** dentro de tu Worker | Sí: tú guardas el usuario en D1 |
| SPA estática en Workers/Pages | **Google Identity Services** (ID token) + Worker que valida | Sí |
| El proyecto ya usa Supabase | **Supabase Auth** con proveedor Google | Sí, en Supabase |

Para una aplicación pública con registro propio, la ruta completa es la **B**.
Cloudflare recomienda **Workers** (no Pages) para proyectos nuevos; en Pages el flujo es idéntico dentro de `functions/auth/google.ts`.

---

## 2. Ruta A: Cloudflare Access + Google (sin código)

Sirve para aplicaciones internas. Access pone el login delante de tu dominio; no hay «registro» como tal, solo identidades de Google autorizadas por política.

1. **Google Cloud Console** → crea un proyecto → **APIs & Services → Credentials → Configure Consent Screen**:
   - Audience Type: **External**.
   - Nombre de la app, correo de soporte y correo de contacto.
2. **Create OAuth client** → tipo **Web application**:
   - *Authorized JavaScript origins*: `https://tu-equipo.cloudflareaccess.com`
   - *Authorized redirect URIs*: `https://tu-equipo.cloudflareaccess.com/cdn-cgi/access/callback`
3. Copia **Client ID** y **Client Secret**.
4. En Cloudflare: **Zero Trust → Integrations → Identity providers → Add new → Google**. Pega el Client ID como *App ID* y el Client Secret. Opcionalmente activa PKCE. Guarda y usa **Test**.
5. **Zero Trust → Access → Applications → Add an application → Self-hosted**:
   - Dominio: `app.tudominio.com`
   - Política **Allow** con *Include*: correos concretos, dominio de correo (`@tudominio.com`) o grupos.
6. Si tu Worker necesita saber quién entró, lee el header `Cf-Access-Jwt-Assertion` y valida el JWT contra `https://tu-equipo.cloudflareaccess.com/cdn-cgi/access/certs` usando el **AUD** de la aplicación de Access. Así obtienes `email` y `sub` para crear tu registro interno si hace falta.

```ts
import { createRemoteJWKSet, jwtVerify } from 'jose'

const team = 'tu-equipo'
const JWKS = createRemoteJWKSet(
  new URL(`https://${team}.cloudflareaccess.com/cdn-cgi/access/certs`),
)

const assertion = c.req.header('Cf-Access-Jwt-Assertion')
if (!assertion) return c.text('No autenticado', 401)

const { payload } = await jwtVerify(assertion, JWKS, {
  issuer: `https://${team}.cloudflareaccess.com`,
  audience: c.env.ACCESS_AUD,
})

const email = payload.email as string
const sub = payload.sub as string
```

> El plan gratuito de Zero Trust cubre hasta 50 usuarios; verifica límites vigentes antes de usarlo en producción.

---

## 3. Ruta B: OAuth propio en un Worker (app pública)

### 3.1 Google Cloud Console

1. Crea un proyecto y configura la pantalla de consentimiento (**External**).
2. Scopes: `openid`, `email`, `profile`. Son no sensibles: no requieren verificación de Google, pero mientras la app esté en **Testing** solo entran los usuarios de prueba (máx. 100).
3. **Credentials → Create OAuth client → Web application**:
   - *Authorized JavaScript origins*: `https://tudominio.com` y `DEV_URL`
   - *Authorized redirect URIs*: exactamente
     - `https://tudominio.com/auth/google/callback`
     - `DEV_URL/auth/google/callback`
4. Guarda **Client ID** y **Client Secret**. El secreto nunca va al frontend ni a `[vars]`.

### 3.2 Secretos y recursos en Cloudflare

```bash
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
```

> Con el CLI `cf` los secretos individuales todavía se suben con `npx wrangler secret put`. Para D1/KV puedes usar `cf` o el dashboard.

`wrangler.jsonc` mínimo:

```jsonc
{
  "name": "mi-app",
  "main": "src/index.ts",
  "compatibility_date": "2026-11-01",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "mi-app-db",
      "database_id": "<database_id>"
    }
  ]
}
```

Dependencias:

```bash
npm i hono jose
```

### 3.3 Modelo de datos (D1)

```sql
CREATE TABLE usuarios (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  email_verificado INTEGER NOT NULL DEFAULT 0,
  nombre TEXT,
  avatar_url TEXT,
  terminos_version TEXT,
  onboarding_completo INTEGER NOT NULL DEFAULT 0,
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  ultimo_acceso TEXT
);

CREATE TABLE cuentas_oauth (
  proveedor TEXT NOT NULL,          -- 'google'
  proveedor_uid TEXT NOT NULL,      -- claim sub
  usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (proveedor, proveedor_uid)
);

CREATE TABLE sesiones (
  id TEXT PRIMARY KEY,              -- hash SHA-256 del token de sesión
  usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  expira_en INTEGER NOT NULL,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_sesiones_usuario ON sesiones (usuario_id);
```

La clave de identidad es **`sub` de Google**, no el correo. El correo puede cambiar; `sub` no.

### 3.4 Flujo con redirect + PKCE (código completo)

```ts
// src/index.ts
import { Hono } from 'hono'
import type { Context } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

type Env = {
  DB: D1Database
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
}

type Variables = {
  usuario: { id: string; email: string; nombre: string | null }
}

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

const b64url = (data: Uint8Array | ArrayBuffer) => {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const random = (n = 32) => b64url(crypto.getRandomValues(new Uint8Array(n)))

const sha256 = async (text: string) =>
  b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))

const esHttps = (c: Context) => new URL(c.req.url).protocol === 'https:'

// 1) Inicio: state + PKCE en cookie HttpOnly y redirección a Google
app.get('/auth/google', async (c) => {
  const state = random()
  const verifier = random()
  const origin = new URL(c.req.url).origin

  setCookie(c, 'oauth', JSON.stringify({ state, verifier }), {
    httpOnly: true,
    secure: esHttps(c),
    sameSite: 'Lax',
    path: '/auth/google',
    maxAge: 600,
  })

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', c.env.GOOGLE_CLIENT_ID)
  url.searchParams.set('redirect_uri', `${origin}/auth/google/callback`)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid email profile')
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', await sha256(verifier))
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('prompt', 'select_account')

  return c.redirect(url.toString())
})

// 2) Callback: valida state, canjea el code y crea la sesión propia
app.get('/auth/google/callback', async (c) => {
  const { code, state } = c.req.query()
  const cookieOauth = getCookie(c, 'oauth')
  deleteCookie(c, 'oauth', { path: '/auth/google' })

  if (!code || !state || !cookieOauth) return c.text('Solicitud inválida', 400)

  let guardado: { state: string; verifier: string }
  try {
    guardado = JSON.parse(cookieOauth)
  } catch {
    return c.text('Solicitud inválida', 400)
  }

  if (state !== guardado.state) return c.text('State inválido', 401)

  const origin = new URL(c.req.url).origin
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      code,
      code_verifier: guardado.verifier,
      grant_type: 'authorization_code',
      redirect_uri: `${origin}/auth/google/callback`,
    }),
  })

  if (!tokenRes.ok) return c.text('No se pudo completar el acceso con Google', 401)

  const { access_token } = (await tokenRes.json()) as { access_token: string }

  const perfilRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { authorization: `Bearer ${access_token}` },
  })

  if (!perfilRes.ok) return c.text('No se pudo leer el perfil de Google', 401)

  const perfil = (await perfilRes.json()) as {
    sub: string
    email: string
    email_verified: boolean
    name?: string
    picture?: string
  }

  if (!perfil.email_verified) {
    return c.text('Tu correo de Google no está verificado', 403)
  }

  const resultado = await altaOActualizacion(c.env.DB, perfil)

  if (resultado.tipo === 'conflicto') {
    return c.redirect('/login?error=cuenta_existente')
  }

  await crearSesion(c.env.DB, resultado.usuarioId, c)
  return c.redirect('/app')
})

// 3) Protección de rutas con la sesión propia
app.use('/app/*', async (c, next) => {
  const token = getCookie(c, 'sesion')
  if (!token) return c.redirect('/auth/google')

  const sesion = await c.env.DB.prepare(
    `SELECT u.id, u.email, u.nombre
       FROM sesiones s
       JOIN usuarios u ON u.id = s.usuario_id
      WHERE s.id = ? AND s.expira_en > unixepoch()`,
  )
    .bind(await sha256(token))
    .first<{ id: string; email: string; nombre: string | null }>()

  if (!sesion) return c.redirect('/auth/google')

  c.set('usuario', sesion)
  await next()
})

app.post('/auth/logout', async (c) => {
  const token = getCookie(c, 'sesion')

  if (token) {
    await c.env.DB.prepare('DELETE FROM sesiones WHERE id = ?').bind(await sha256(token)).run()
  }

  deleteCookie(c, 'sesion', { path: '/' })
  return c.redirect('/')
})

async function altaOActualizacion(
  db: D1Database,
  perfil: { sub: string; email: string; name?: string; picture?: string },
): Promise<{ tipo: 'ok'; usuarioId: string } | { tipo: 'conflicto' }> {
  const cuenta = await db
    .prepare('SELECT usuario_id FROM cuentas_oauth WHERE proveedor = ? AND proveedor_uid = ?')
    .bind('google', perfil.sub)
    .first<{ usuario_id: string }>()

  if (cuenta) {
    await db
      .prepare(
        `UPDATE usuarios
            SET nombre = COALESCE(?, nombre),
                avatar_url = COALESCE(?, avatar_url),
                ultimo_acceso = datetime('now')
          WHERE id = ?`,
      )
      .bind(perfil.name ?? null, perfil.picture ?? null, cuenta.usuario_id)
      .run()

    return { tipo: 'ok', usuarioId: cuenta.usuario_id }
  }

  const porEmail = await db
    .prepare('SELECT id FROM usuarios WHERE email = ?')
    .bind(perfil.email)
    .first<{ id: string }>()

  // No fusionar automáticamente una cuenta existente con otro método de acceso
  if (porEmail) return { tipo: 'conflicto' }

  const id = crypto.randomUUID()

  await db.batch([
    db
      .prepare(
        `INSERT INTO usuarios (id, email, email_verificado, nombre, avatar_url, ultimo_acceso)
         VALUES (?, ?, 1, ?, ?, datetime('now'))`,
      )
      .bind(id, perfil.email, perfil.name ?? null, perfil.picture ?? null),
    db
      .prepare('INSERT INTO cuentas_oauth (proveedor, proveedor_uid, usuario_id) VALUES (?, ?, ?)')
      .bind('google', perfil.sub, id),
  ])

  return { tipo: 'ok', usuarioId: id }
}

async function crearSesion(db: D1Database, usuarioId: string, c: Context) {
  const token = random()
  const maxAge = 60 * 60 * 24 * 7

  await db
    .prepare('INSERT INTO sesiones (id, usuario_id, expira_en) VALUES (?, ?, ?)')
    .bind(await sha256(token), usuarioId, Math.floor(Date.now() / 1000) + maxAge)
    .run()

  setCookie(c, 'sesion', token, {
    httpOnly: true,
    secure: esHttps(c),
    sameSite: 'Lax',
    path: '/',
    maxAge,
  })
}

export default {
  fetch: app.fetch,
  async scheduled(_event, env) {
    await env.DB.prepare('DELETE FROM sesiones WHERE expira_en < unixepoch()').run()
  },
} satisfies ExportedHandler<Env>
```

Cron de limpieza en `wrangler.jsonc`:

```jsonc
{
  "triggers": {
    "crons": ["0 3 * * *"]
  }
}
```

Si prefieres no escribir el flujo, `@hono/oauth-providers` lo encapsula:

```ts
import { googleAuth } from '@hono/oauth-providers/google'

app.use(
  '/auth/google',
  googleAuth({
    client_id: c.env.GOOGLE_CLIENT_ID,
    client_secret: c.env.GOOGLE_CLIENT_SECRET,
    scope: ['openid', 'email', 'profile'],
  }),
)
```

Ese middleware ya usa `state` en una cookie HttpOnly, pero **no implementa PKCE**; el flujo manual de arriba sí.

### 3.5 Variante SPA: Google Identity Services (ID token)

Si tu frontend es una SPA y no quieres redirects:

```ts
// Worker: emite un nonce de un solo uso para evitar reutilización de credenciales
app.get('/api/auth/nonce', (c) => {
  const nonce = crypto.randomUUID()

  setCookie(c, 'g_nonce', nonce, {
    httpOnly: true,
    secure: esHttps(c),
    sameSite: 'Lax',
    path: '/',
    maxAge: 600,
  })

  return c.json({ nonce })
})
```

```html
<script src="https://accounts.google.com/gsi/client" async></script>
<script>
  window.addEventListener('load', async () => {
    const { nonce } = await (await fetch('/api/auth/nonce')).json()

    google.accounts.id.initialize({
      client_id: 'TU_CLIENT_ID',
      nonce,
      callback: async ({ credential }) => {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ credential }),
        })

        if (res.ok) location.href = '/app'
      },
    })

    google.accounts.id.renderButton(document.getElementById('google-btn'), {
      theme: 'outline',
      size: 'large',
    })
  })
</script>
```

En el Worker, `credential` es un **ID token JWT** que debes verificar:

```ts
import { createRemoteJWKSet, jwtVerify } from 'jose'

const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs'),
)

app.post('/api/auth/google', async (c) => {
  const { credential } = await c.req.json<{ credential?: string }>()
  if (!credential) return c.json({ error: 'Falta credential' }, 400)

  const { payload } = await jwtVerify(credential, JWKS, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: c.env.GOOGLE_CLIENT_ID,
  })

  const nonceEsperado = getCookie(c, 'g_nonce')
  deleteCookie(c, 'g_nonce', { path: '/' })

  if (!nonceEsperado || payload.nonce !== nonceEsperado) {
    return c.json({ error: 'Nonce inválido' }, 401)
  }

  const resultado = await altaOActualizacion(c.env.DB, {
    sub: payload.sub!,
    email: payload.email as string,
    name: payload.name as string | undefined,
    picture: payload.picture as string | undefined,
  })

  if (resultado.tipo === 'conflicto') {
    return c.json({ error: 'cuenta_existente' }, 409)
  }

  await crearSesion(c.env.DB, resultado.usuarioId, c)
  return c.json({ ok: true })
})
```

No uses `gapi.auth2`: está obsoleto. Usa GIS o el flujo redirect.

### 3.6 Alternativa sin código propio: Supabase Auth

Si el proyecto ya usa Supabase:

1. En Supabase: **Authentication → Providers → Google**, pega Client ID y Client Secret.
2. En Google Console añade como redirect URI:
   `https://<project-ref>.supabase.co/auth/v1/callback`
3. En Supabase: **Authentication → URL Configuration** con tu dominio y `DEV_URL`.
4. En el frontend:

```ts
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: 'https://tudominio.com/auth/callback' },
})
```

Cloudflare solo hostea el frontend; las cuentas viven en Supabase.

---

## 4. Alta de cuenta y onboarding

El registro con Google es un **upsert** en el primer login:

1. ¿Existe `(proveedor='google', proveedor_uid=sub)`? → inicia sesión.
2. ¿No existe pero el correo ya está en `usuarios`? → no dupliques ni fusiones a ciegas. Pide que inicie sesión con su método original; si quieres vincular, hazlo después de autenticarlo.
3. ¿No existe nada? → crea `usuarios` + `cuentas_oauth` en una transacción (`db.batch`).

Si necesitas aceptar términos o pedir nombre de usuario, redirige a `/onboarding` cuando `onboarding_completo = 0` y guarda la versión de términos aceptada en `terminos_version`.

---

## 5. Sesiones y limpieza

- Sesión propia con token aleatorio, guardado como **hash** en D1 y cookie `HttpOnly; Secure; SameSite=Lax`.
- En producción puedes usar `__Host-sesion` (exige `Secure`, `Path=/` y sin `Domain`).
- Limpia sesiones vencidas con un Cron Trigger (ver §3.4).
- No guardes el `access_token` de Google si no lo necesitas para llamar a sus APIs; si lo necesitas, guárdalo cifrado y con caducidad.
- Logout local: borra la fila de `sesiones` y la cookie. No hace falta cerrar la sesión global de Google.

---

## 6. Checklist de seguridad

- [ ] `state` validado y de un solo uso, y **PKCE S256** en el flujo redirect.
- [ ] `redirect_uri` exacta en Google Console: sin comodines, con esquema, host y puerto.
- [ ] Client Secret solo en secretos del Worker, nunca en el bundle ni en `[vars]`.
- [ ] Validar `iss`, `aud`, `exp` (y `nonce` si usas GIS) al verificar ID tokens.
- [ ] Usar `sub` como identificador; rechazar `email_verified === false`.
- [ ] No crear ni fusionar cuentas por correo sin verificación.
- [ ] Cookies `HttpOnly`, `Secure`, `SameSite=Lax`; rotar/expirar sesiones.
- [ ] Rate limiting en `/auth/*` y `/api/auth/*` (reglas de Cloudflare o WAF).
- [ ] No registrar tokens, códigos ni secretos en logs.
- [ ] HTTPS obligatorio en producción.
- [ ] Política de privacidad publicada si guardas datos de Google.
- [ ] Turnstile en formularios públicos de registro, si hay abuso automatizado.

---

## 7. Errores típicos

| Error | Causa habitual |
|---|---|
| `redirect_uri_mismatch` | URI distinta en Google Console (esquema, puerto, `/` final) |
| `403 access_denied` | App en *Testing* y el usuario no es tester, o canceló el consentimiento |
| `invalid_grant` | Código reutilizado/expirado, `redirect_uri` distinto o `code_verifier` que no coincide |
| `deleted_client` | Cliente OAuth eliminado en Google Cloud |
| `idpiframe_initialization_failed` | Falta el origen en *Authorized JavaScript origins* |
| Cookie de sesión no persiste | `Secure` sobre `http://` o dominio/path incorrectos |
| CORS con credenciales | `Access-Control-Allow-Origin` debe ser el origen exacto, no `*` |
| Preview `*.pages.dev` / `*.workers.dev` | Google no admite comodines: usa el dominio de producción como callback o añade cada URL exacta |
| `state` inválido tras el redirect | Cookie bloqueada por el navegador o path de cookie incorrecto |

---

## 8. Pruebas mínimas

1. Login con una cuenta nueva → se crea el usuario y entra a `/app`.
2. Login con la misma cuenta → no se duplica; actualiza `ultimo_acceso`.
3. Modificar el `state` en la URL del callback → `401`.
4. Reutilizar la URL del callback → error controlado.
5. Correo ya registrado con otro método → mensaje de cuenta existente, sin duplicado.
6. Sesión expirada → redirección al login.
7. Logout → la cookie desaparece y la fila de `sesiones` se borra.

Local: `npx wrangler dev` y `DEV_URL/auth/google/callback` registrado en Google.
En producción, revisa con `npx wrangler tail` sin volcar tokens.

---

## 9. Referencias

- [Cloudflare — Google como IdP](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/google/)
- [Cloudflare Access — aplicaciones](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/)
- [Google — OAuth 2.0 para aplicaciones web](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google — verificar ID tokens](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)
- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [Hono OAuth Providers](https://github.com/honojs/middleware/tree/main/packages/oauth-providers)
- [jose (JWT/JWKS en Workers)](https://github.com/panva/jose)
- [Supabase Auth — Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
