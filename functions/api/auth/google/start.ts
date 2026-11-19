import { CURRENT_TERMS_VERSION } from '../../../../shared/terms'
import {
  GOOGLE_AUTHORIZE_URL,
  OAUTH_STATE_TTL_SECONDS,
  codeChallenge,
  googleConfig,
  isHttpsRequest,
  oauthCookieHeader,
  randomUrlToken,
} from '../../../_lib/google'
import { isSameOrigin, json, readJsonObject } from '../../../_lib/http'

// Crea el state y el verificador PKCE, los guarda en una cookie HttpOnly y
// devuelve la URL de Google para que el navegador navegue a ella.
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!isSameOrigin(request)) return json({ error: 'Solicitud de origen no permitido.' }, 403)

  const config = googleConfig(env)
  if (!config) {
    return json({ error: 'El inicio de sesión con Google no está configurado.' }, 503)
  }

  let termsVersion: string | null = null
  const contentType = request.headers.get('Content-Type') ?? ''
  if (contentType.toLowerCase().startsWith('application/json')) {
    const body = await readJsonObject(request)
    if (body && typeof body.acceptedTermsVersion === 'string') {
      if (body.acceptedTermsVersion !== CURRENT_TERMS_VERSION) {
        return json({ error: 'Debes aceptar la versión vigente de los términos para crear una cuenta.' }, 400)
      }
      termsVersion = body.acceptedTermsVersion
    }
  }

  const state = randomUrlToken()
  const verifier = randomUrlToken()
  const origin = new URL(request.url).origin

  const authorizeUrl = new URL(GOOGLE_AUTHORIZE_URL)
  authorizeUrl.searchParams.set('client_id', config.clientId)
  authorizeUrl.searchParams.set('redirect_uri', `${origin}/api/auth/google/callback`)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('scope', 'openid email profile')
  authorizeUrl.searchParams.set('state', state)
  authorizeUrl.searchParams.set('code_challenge', await codeChallenge(verifier))
  authorizeUrl.searchParams.set('code_challenge_method', 'S256')
  authorizeUrl.searchParams.set('prompt', 'select_account')

  const cookie = oauthCookieHeader(
    JSON.stringify({ state, verifier, termsVersion }),
    OAUTH_STATE_TTL_SECONDS,
    isHttpsRequest(request),
  )

  return json({ url: authorizeUrl.toString() }, 200, { 'Set-Cookie': cookie })
}
