import { getAuthenticatedSession } from '../../_lib/auth'
import { isSameOrigin, json, readJsonObject } from '../../_lib/http'
import { inventoryProfileForBusinessType, isSelectableBusinessType } from '../../../shared/business-types'
import { isCityForCountry, isCountryCode } from '../../../shared/locations'
import { COUNTRIES } from '../../../shared/locations'

export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  if (!isSameOrigin(request)) return json({ error: 'Solicitud de origen no permitido.' }, 403)
  const session = await getAuthenticatedSession(request, env.DB)
  if (!session) return json({ error: 'Inicia sesión para continuar.' }, 401)
  if (session.role !== 'owner') return json({ error: 'Solo el propietario puede configurar esta cuenta.' }, 403)

  const body = await readJsonObject(request)
  if (!body) return json({ error: 'Se requiere un cuerpo JSON válido de hasta 16 KB.' }, 400)
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const businessType = body.businessType
  const currency = typeof body.currency === 'string' ? body.currency.trim().toUpperCase() : ''
  const countryCode = body.countryCode === null || body.countryCode === '' ? null : body.countryCode
  const city = body.city === null || body.city === '' ? null : body.city
  const address = typeof body.address === 'string' ? body.address.trim() : ''
  const phoneCountryCode = typeof body.phoneCountryCode === 'string' ? body.phoneCountryCode.trim() : ''
  const customPhoneDialCode = typeof body.customPhoneDialCode === 'string' ? body.customPhoneDialCode.trim() : ''
  const phoneNumber = typeof body.phoneNumber === 'string' ? body.phoneNumber.replace(/[\s().-]/gu, '') : ''
  if (name.length < 2 || name.length > 100) return json({ error: 'El nombre del negocio debe tener entre 2 y 100 caracteres.' }, 400)
  if (!isSelectableBusinessType(businessType)) return json({ error: 'Selecciona un tipo de negocio válido.' }, 400)
  if (!['NIO', 'USD'].includes(currency) && currency !== session.currency) return json({ error: 'Selecciona una moneda disponible.' }, 400)
  if (countryCode !== null && !isCountryCode(countryCode)) return json({ error: 'Selecciona un país válido.' }, 400)
  if (city !== null && (!countryCode || !isCityForCountry(countryCode, city))) return json({ error: 'Selecciona una ciudad válida para el país.' }, 400)
  if (address.length > 300) return json({ error: 'La dirección no puede superar 300 caracteres.' }, 400)
  const phoneCountry = COUNTRIES.find((item) => item.code === phoneCountryCode)
  const phoneDialCode = phoneCountryCode === 'OTHER' ? customPhoneDialCode : phoneCountry?.dialCode
  if (!phoneCountry || !phoneDialCode || !/^\+\d{1,4}$/u.test(phoneDialCode)) return json({ error: 'Selecciona el prefijo telefónico de un país válido.' }, 400)
  if (!/^\d{6,14}$/u.test(phoneNumber) || `${phoneDialCode}${phoneNumber}`.length > 16) return json({ error: 'Ingresa un número telefónico válido.' }, 400)

  const slugBase = name.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '').slice(0, 40) || 'tienda'
  const suffix = session.tenantId.slice(0, 6)
  const baseSlug = `${slugBase}-${suffix}`
  const slug = reservedSlugs.has(slugBase) ? `negocio-${baseSlug}` : baseSlug
  const existing = await env.DB.prepare('SELECT id FROM tenants WHERE slug = ?1 AND id != ?2').bind(slug, session.tenantId).first()
  const finalSlug = existing ? `${slug}-${session.tenantId.slice(6, 10)}` : slug
  const result = await env.DB.prepare(`
    UPDATE tenants
    SET name = ?1, slug = ?2, business_type = ?3, inventory_profile = ?4, currency = ?5,
        country = ?6, city = ?7, physical_address = ?8, phone_country_code = ?9,
        phone_number = ?10, setup_completed = 1
    WHERE id = ?11 AND EXISTS (
      SELECT 1 FROM tenant_memberships WHERE tenant_id = ?11 AND user_id = ?12 AND role = 'owner'
    ) AND (?5 = currency OR NOT EXISTS (SELECT 1 FROM products WHERE products.tenant_id = tenants.id))
  `).bind(name, finalSlug, businessType, inventoryProfileForBusinessType(businessType), currency, countryCode, city, address || null, phoneCountryCode, `${phoneDialCode}${phoneNumber}`, session.tenantId, session.userId).run()
  if (result.meta.changes !== 1) return json({ error: 'No se pudo guardar la configuración de la cuenta.' }, 409)
  return json({ name, slug: finalSlug, businessType, currency, setupCompleted: true, countryCode, city, address: address || null })
}

const reservedSlugs = new Set(['admin', 'api', 'catalogo', 'catalog', 'login', 'registro', 'register', 'dashboard', 'configuracion', 'settings', 'producto', 'products'])
