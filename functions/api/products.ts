import { getAuthenticatedSession } from '../_lib/auth'
import { isSameOrigin, json, readJsonObject } from '../_lib/http'

const maxPageSize = 100
const defaultPageSize = 25

type ProductRow = {
  id: string
  name: string
  sku: string
  category: string
  inventory_profile: string
  quantity: number
  min_stock: number
  unit: string
  cost: number
  price: number
  variant: string | null
  serial_tracking: string | null
  created_at: string
  image_id: string | null
  archived_at: string | null
}

type Cursor = { createdAt: string; id: string }

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function decodeCursor(value: string | null): Cursor | null | false {
  if (!value) return null
  if (value.length > 256 || !/^[A-Za-z0-9_-]+$/u.test(value)) return false
  try {
    const jsonValue: unknown = JSON.parse(atob(value.replaceAll('-', '+').replaceAll('_', '/')))
    if (typeof jsonValue !== 'object' || jsonValue === null) return false
    const cursor = jsonValue as Record<string, unknown>
    if (typeof cursor.createdAt !== 'string' || typeof cursor.id !== 'string') return false
    if (!/^\d{4}-\d\d-\d\dT/u.test(cursor.createdAt) || !/^[\da-f-]{36}$/iu.test(cursor.id)) return false
    return { createdAt: cursor.createdAt, id: cursor.id }
  } catch {
    return false
  }
}

function encodeCursor(cursor: Cursor): string {
  return btoa(JSON.stringify(cursor)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '')
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const session = await getAuthenticatedSession(request, env.DB)
  if (!session) return json({ error: 'Inicia sesión para continuar.' }, 401)

  const url = new URL(request.url)
  const rawLimit = url.searchParams.get('limit')
  const requestedLimit = rawLimit === null ? defaultPageSize : Number(rawLimit)
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > maxPageSize) {
    return json({ error: `El límite debe estar entre 1 y ${maxPageSize}.` }, 400)
  }
  const search = (url.searchParams.get('q') ?? '').trim()
  if (search.length > 100) return json({ error: 'La búsqueda no puede superar 100 caracteres.' }, 400)

  const status = url.searchParams.get('status') ?? 'all'
  if (!['all', 'in', 'low', 'out'].includes(status)) return json({ error: 'Filtro de existencias no válido.' }, 400)
  const archived = url.searchParams.get('archived') ?? 'active'
  if (!['active', 'archived', 'all'].includes(archived)) return json({ error: 'Filtro de archivo no válido.' }, 400)
  const cursor = decodeCursor(url.searchParams.get('cursor'))
  if (cursor === false) return json({ error: 'Cursor de paginación no válido.' }, 400)

  const rows = await env.DB.prepare(`
    SELECT id, name, sku, category, inventory_profile, quantity, min_stock,
           unit, cost, price, variant, serial_tracking, created_at,
           archived_at,
           (SELECT i.id FROM product_images i
             WHERE i.tenant_id = products.tenant_id AND i.product_id = products.id
             ORDER BY i.position ASC LIMIT 1) AS image_id
    FROM products
    WHERE tenant_id = ?1
      AND (?2 IS NULL OR instr(lower(name), lower(?2)) > 0
        OR instr(lower(sku), lower(?2)) > 0 OR instr(lower(category), lower(?2)) > 0)
      AND (
        ?3 = 'all'
        OR (?3 = 'in' AND quantity > min_stock)
        OR (?3 = 'low' AND quantity > 0 AND quantity <= min_stock)
        OR (?3 = 'out' AND quantity = 0)
      )
      AND (?4 IS NULL OR created_at < ?4 OR (created_at = ?4 AND id < ?5))
      AND (?7 = 'all' OR (?7 = 'active' AND archived_at IS NULL) OR (?7 = 'archived' AND archived_at IS NOT NULL))
    ORDER BY created_at DESC, id DESC
    LIMIT ?6
  `).bind(
    session.tenantId,
    search || null,
    status,
    cursor?.createdAt ?? null,
    cursor?.id ?? null,
    requestedLimit + 1,
    archived,
  ).all<ProductRow>()
  const total = await env.DB.prepare(`
    SELECT COUNT(*) AS count
    FROM products
    WHERE tenant_id = ?1
      AND (?2 IS NULL OR instr(lower(name), lower(?2)) > 0
        OR instr(lower(sku), lower(?2)) > 0 OR instr(lower(category), lower(?2)) > 0)
      AND (
        ?3 = 'all'
        OR (?3 = 'in' AND quantity > min_stock)
        OR (?3 = 'low' AND quantity > 0 AND quantity <= min_stock)
        OR (?3 = 'out' AND quantity = 0)
      )
      AND (?4 = 'all' OR (?4 = 'active' AND archived_at IS NULL) OR (?4 = 'archived' AND archived_at IS NOT NULL))
  `).bind(session.tenantId, search || null, status, archived).first<{ count: number }>()

  const hasMore = rows.results.length > requestedLimit
  const page = hasMore ? rows.results.slice(0, requestedLimit) : rows.results
  const last = page.at(-1)
  return json({
    items: page.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      profile: product.inventory_profile,
      quantity: product.quantity,
      minStock: product.min_stock,
      unit: product.unit,
      cost: product.cost,
      price: product.price,
      variant: product.variant,
      serial: product.serial_tracking,
      createdAt: product.created_at,
      archivedAt: product.archived_at,
      imageUrl: product.image_id
        ? `/api/products/${encodeURIComponent(product.id)}/images/${encodeURIComponent(product.image_id)}`
        : null,
    })),
    nextCursor: hasMore && last ? encodeCursor({ createdAt: last.created_at, id: last.id }) : null,
    total: total?.count ?? 0,
  })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!isSameOrigin(request)) return json({ error: 'Solicitud de origen no permitido.' }, 403)
  const session = await getAuthenticatedSession(request, env.DB)
  if (!session) return json({ error: 'Inicia sesión para continuar.' }, 401)
  if (!['owner', 'manager'].includes(session.role)) return json({ error: 'No tienes permiso para crear productos.' }, 403)

  const plan = await env.DB.prepare(`
    SELECT plan_tier AS planTier, trial_started_at AS trialStartedAt
    FROM tenants WHERE id = ?1 LIMIT 1
  `).bind(session.tenantId).first<{ planTier: string; trialStartedAt: string | null }>()
  if (!plan) return json({ error: 'No se encontró el plan de esta cuenta.' }, 404)
  const trialEndsAt = plan.trialStartedAt ? Date.parse(plan.trialStartedAt) + 7 * 24 * 60 * 60 * 1000 : 0
  if (plan.planTier !== 'paid' && (!plan.trialStartedAt || Date.now() >= trialEndsAt)) {
    return json({ error: 'Tu prueba gratuita terminó. El plan de $5 al mes es necesario para agregar más productos.' }, 402)
  }

  const body = await readJsonObject(request)
  if (!body) return json({ error: 'Se requiere un cuerpo JSON válido de hasta 16 KB.' }, 400)
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const sku = typeof body.sku === 'string' ? body.sku.trim() : ''
  const category = typeof body.category === 'string' ? body.category.trim() : 'General'
  const profile = session.profile
  const unit = typeof body.unit === 'string' ? body.unit.trim() : ''
  const variant = typeof body.variant === 'string' ? body.variant.trim() : null
  const serial = typeof body.serial === 'string' ? body.serial.trim() : null
  const quantity = body.quantity === undefined ? 0 : body.quantity
  const minStock = body.minStock === undefined ? 0 : body.minStock
  const cost = body.cost === undefined ? 0 : body.cost
  const price = body.price === undefined ? 0 : body.price

  if (name.length < 1 || name.length > 160) return json({ error: 'El nombre debe tener entre 1 y 160 caracteres.' }, 400)
  if (sku.length < 1 || sku.length > 80) return json({ error: 'El SKU debe tener entre 1 y 80 caracteres.' }, 400)
  if (category.length > 80 || unit.length < 1 || unit.length > 30) return json({ error: 'Categoría o unidad no válida.' }, 400)
  if (variant && variant.length > 160 || serial && serial.length > 160) return json({ error: 'Variante o dato de serie demasiado largo.' }, 400)
  if (!isNonNegativeNumber(quantity) || !isNonNegativeNumber(minStock) || !isNonNegativeNumber(cost) || !isNonNegativeNumber(price)) {
    return json({ error: 'Cantidad, costo y precio deben ser números no negativos.' }, 400)
  }

  const productId = crypto.randomUUID()
  const movementId = crypto.randomUUID()
  const now = new Date().toISOString()

  try {
    const statements = [
      env.DB.prepare(`
        INSERT INTO products (
          id, tenant_id, name, sku, category, inventory_profile, quantity,
          min_stock, unit, cost, price, variant, serial_tracking, created_at, updated_at
        ) SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?14
        WHERE ?15 = 'paid' OR (
          ?16 > ?14 AND (SELECT COUNT(*) FROM products WHERE tenant_id = ?2) < 10
        )
      `).bind(
        productId, session.tenantId, name, sku, category || 'General', profile,
        quantity, minStock, unit, cost, price, variant || null, serial || null, now,
        plan.planTier, plan.trialStartedAt ? new Date(Date.parse(plan.trialStartedAt) + 7 * 24 * 60 * 60 * 1000).toISOString() : '',
      ),
    ]

    if (quantity > 0) {
      statements.push(env.DB.prepare(`
        INSERT INTO stock_movements (
          id, tenant_id, product_id, user_id, quantity_change,
          quantity_before, quantity_after, reason, created_at
        ) SELECT ?1, ?2, ?3, ?4, ?5, 0, ?5, 'Existencia inicial del producto', ?6
          WHERE EXISTS (SELECT 1 FROM products WHERE tenant_id = ?2 AND id = ?3)
      `).bind(movementId, session.tenantId, productId, session.userId, quantity, now))
    }

    const result = await env.DB.batch(statements)
    if ((result[0]?.meta.changes ?? 0) !== 1) {
      return json({ error: plan.planTier === 'paid'
        ? 'No se pudo guardar el producto.'
        : 'El plan gratuito permite hasta 10 productos por 7 días. El plan de $5 al mes permite continuar.' }, 402)
    }
  } catch (error) {
    console.error('Product creation failed.', error)
    if (String(error).toLowerCase().includes('unique')) return json({ error: 'Ya existe un producto con ese SKU.' }, 409)
    return json({ error: 'No se pudo guardar el producto.' }, 500)
  }

  return json({ id: productId, movementId: quantity > 0 ? movementId : null, name, sku, profile, quantity, createdAt: now }, 201)
}
