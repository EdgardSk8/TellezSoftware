import { getAuthenticatedSession } from '../../_lib/auth'
import { json } from '../../_lib/http'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const session = await getAuthenticatedSession(request, env.DB)
  if (!session) return json({ error: 'Inicia sesión para continuar.' }, 401)
  return json({
    user: { id: session.userId, email: session.email, emailVerified: Boolean(session.emailVerified) },
    tenant: {
      id: session.tenantId,
      name: session.tenantName,
      slug: session.tenantSlug,
      profile: session.profile,
      businessType: session.businessType,
      currency: session.currency,
      setupCompleted: Boolean(session.setupCompleted),
      countryCode: session.countryCode,
      city: session.city,
      address: session.address,
      trialStartedAt: session.trialStartedAt,
      planTier: session.planTier,
      role: session.role,
    },
  })
}
