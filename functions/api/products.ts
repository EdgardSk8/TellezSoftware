import { getAuthenticatedSession } from '../_lib/auth'
import { isSameOrigin, json, readJsonObject } from '../_lib/http'

const profiles = new Set(['clothing', 'hardware', 'solid_goods', 'personal'])
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
  const cursor = decodeCursor(url.searchParams.get('cursor'))
  if (cursor === false) return json({ error: 'Cursor de paginación no válido.' }, 400)

  const pattern = search ? `%${search.replaceAll('%', '\\%').replaceAll('_', '\\_')}%` : null
  const rows = await env.DB.prepare(`
    SELECT id, name, sku, category, inventory_profile, quantity, min_stock,
           unit, cost, price, variant, serial_tracking, created_at
    FROM products
    WHERE tenant_id = ?1
      AND (?2 IS NULL OR name LIKE ?2 ESCAPE '\\' OR sku LIKE ?2 ESCAPE '\\' OR category LIKE ?2 ESCAPE '\\')
      AND (
        ?3 = 'all'
        OR (?3 = 'in' AND quantity > min_stock)
        OR (?3 = 'low' AND quantity > 0 AND quantity <= min_stock)
        OR (?3 = 'out' AND quantity = 0)
      )
      AND (?4 IS NULL OR created_at < ?4 OR (created_at = ?4 AND id < ?5))
    ORDER BY created_at DESC, id DESC
    LIMIT ?6
  `).bind(
    session.tenantId,
    pattern,
    status,
    cursor?.createdAt ?? null,
    cursor?.id ?? null,
    requestedLimit + 1,
  ).all<ProductRow>()

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
    })),
    nextCursor: hasMore && last ? encodeCursor({ createdAt: last.created_at, id: last.id }) : null,
  })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!isSameOrigin(request)) return json({ error: 'Solicitud de origen no permitido.' }, 403)
  const session = await getAuthenticatedSession(request, env.DB)
  if (!session) return json({ error: 'Inicia sesión para continuar.' }, 401)
  if (!['owner', 'manager'].includes(session.role)) return json({ error: 'No tienes permiso para crear productos.' }, 403)

  const body = await readJsonObject(request)
  if (!body) return json({ error: 'Se requiere un cuerpo JSON válido de hasta 16 KB.' }, 400)
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const sku = typeof body.sku === 'string' ? body.sku.trim() : ''
  const category = typeof body.category === 'string' ? body.category.trim() : 'General'
  const profile = typeof body.profile === 'string' ? body.profile : ''
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
  if (!profiles.has(profile) || profile !== (await env.DB.prepare('SELECT inventory_profile FROM tenants WHERE id = ?1')
    .bind(session.tenantId).first<{ inventory_profile: string }>())?.inventory_profile) {
    return json({ error: 'El perfil del producto debe coincidir con el perfil del espacio de trabajo.' }, 400)
  }
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
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?14)
      `).bind(
        productId, session.tenantId, name, sku, category || 'General', profile,
        quantity, minStock, unit, cost, price, variant || null, serial || null, now,
      ),
    ]

    if (quantity > 0) {
      statements.push(env.DB.prepare(`
        INSERT INTO stock_movements (
          id, tenant_id, product_id, user_id, quantity_change,
          quantity_before, quantity_after, reason, created_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, 0, ?5, 'Existencia inicial del producto', ?6)
      `).bind(movementId, session.tenantId, productId, session.userId, quantity, now))
    }

    await env.DB.batch(statements)
  } catch (error) {
    console.error('Product creation failed.', error)
    if (String(error).toLowerCase().includes('unique')) return json({ error: 'Ya existe un producto con ese SKU.' }, 409)
    return json({ error: 'No se pudo guardar el producto.' }, 500)
  }

  return json({ id: productId, movementId: quantity > 0 ? movementId : null, name, sku, quantity, createdAt: now }, 201)
}
