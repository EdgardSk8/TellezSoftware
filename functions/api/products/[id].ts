import { getAuthenticatedSession } from '../../_lib/auth'
import { isSameOrigin, json, readJsonObject } from '../../_lib/http'

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
  archived_at: string | null
  updated_at: string
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!isSameOrigin(request)) return json({ error: 'Solicitud de origen no permitido.' }, 403)
  const session = await getAuthenticatedSession(request, env.DB)
  if (!session) return json({ error: 'Inicia sesión para continuar.' }, 401)
  if (!['owner', 'manager'].includes(session.role)) {
    return json({ error: 'No tienes permiso para modificar productos.' }, 403)
  }
  if (typeof params.id !== 'string' || !/^[\da-f-]{36}$/iu.test(params.id)) {
    return json({ error: 'Identificador de producto no válido.' }, 400)
  }

  const body = await readJsonObject(request)
  if (!body) return json({ error: 'Se requiere un cuerpo JSON válido de hasta 16 KB.' }, 400)
  const current = await env.DB.prepare(`
    SELECT id, name, sku, category, inventory_profile, quantity, min_stock,
           unit, cost, price, variant, serial_tracking, archived_at, updated_at
    FROM products
    WHERE id = ?1 AND tenant_id = ?2
    LIMIT 1
  `).bind(params.id, session.tenantId).first<ProductRow>()
  if (!current) return json({ error: 'No se encontró el producto.' }, 404)

  if (typeof body.archived === 'boolean') {
    const now = new Date().toISOString()
    const result = await env.DB.prepare(`
      UPDATE products
      SET archived_at = ?1, updated_at = ?2
      WHERE id = ?3 AND tenant_id = ?4 AND archived_at IS ?5
    `).bind(body.archived ? now : null, now, current.id, session.tenantId, current.archived_at).run()
    if (result.meta.changes !== 1) return json({ error: 'El producto cambió; actualiza e inténtalo otra vez.' }, 409)
    return json({ id: current.id, archivedAt: body.archived ? now : null })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : current.name
  const sku = typeof body.sku === 'string' ? body.sku.trim() : current.sku
  const category = typeof body.category === 'string' ? body.category.trim() : current.category
  const profile = current.inventory_profile
  const unit = typeof body.unit === 'string' ? body.unit.trim() : current.unit
  const variant = body.variant === null ? null : typeof body.variant === 'string' ? body.variant.trim() : current.variant
  const serial = body.serial === null ? null : typeof body.serial === 'string' ? body.serial.trim() : current.serial_tracking
  const minStock = body.minStock === undefined ? current.min_stock : body.minStock
  const cost = body.cost === undefined ? current.cost : body.cost
  const price = body.price === undefined ? current.price : body.price

  if (name.length < 1 || name.length > 160) return json({ error: 'El nombre debe tener entre 1 y 160 caracteres.' }, 400)
  if (sku.length < 1 || sku.length > 80) return json({ error: 'El SKU debe tener entre 1 y 80 caracteres.' }, 400)
  if (category.length > 80 || unit.length < 1 || unit.length > 30) return json({ error: 'Categoría o unidad no válida.' }, 400)
  if (variant && variant.length > 160 || serial && serial.length > 160) {
    return json({ error: 'Variante o dato de serie demasiado largo.' }, 400)
  }
  if (!isNonNegativeNumber(minStock) || !isNonNegativeNumber(cost) || !isNonNegativeNumber(price)) {
    return json({ error: 'Stock mínimo, costo y precio deben ser números no negativos.' }, 400)
  }

  const updatedAt = new Date().toISOString()
  try {
    const result = await env.DB.prepare(`
      UPDATE products
      SET name = ?1, sku = ?2, category = ?3, inventory_profile = ?4,
          min_stock = ?5, unit = ?6, cost = ?7, price = ?8, variant = ?9,
          serial_tracking = ?10, updated_at = ?11
      WHERE id = ?12 AND tenant_id = ?13 AND updated_at = ?14
        AND archived_at IS NULL
    `).bind(
      name, sku, category || 'General', profile, minStock, unit, cost, price,
      variant || null, serial || null, updatedAt, current.id, session.tenantId, current.updated_at,
    ).run()
    if (result.meta.changes !== 1) return json({ error: 'El producto cambió o está archivado. Actualiza e inténtalo otra vez.' }, 409)
  } catch (error) {
    console.error('Product update failed.', error)
    if (String(error).toLowerCase().includes('unique')) return json({ error: 'Ya existe un producto con ese SKU.' }, 409)
    return json({ error: 'No se pudo guardar el producto.' }, 500)
  }

  return json({
    id: current.id,
    name,
    sku,
    category: category || 'General',
    profile,
    quantity: current.quantity,
    minStock,
    unit,
    cost,
    price,
    variant: variant || null,
    serial: serial || null,
    archivedAt: null,
    updatedAt,
  })
}
