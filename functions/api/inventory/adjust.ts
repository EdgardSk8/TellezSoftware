import { getAuthenticatedSession } from '../../_lib/auth'
import { isSameOrigin, json, readJsonObject } from '../../_lib/http'

type ProductStock = { id: string; name: string; quantity: number }

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!isSameOrigin(request)) return json({ error: 'Solicitud de origen no permitido.' }, 403)
  const session = await getAuthenticatedSession(request, env.DB)
  if (!session) return json({ error: 'Inicia sesión para continuar.' }, 401)
  if (!['owner', 'manager', 'staff'].includes(session.role)) return json({ error: 'No tienes permiso para ajustar existencias.' }, 403)

  const body = await readJsonObject(request)
  if (!body) return json({ error: 'Se requiere un cuerpo JSON válido de hasta 16 KB.' }, 400)
  const productId = typeof body.productId === 'string' ? body.productId : ''
  const change = body.change
  const reason = typeof body.reason === 'string' ? body.reason.trim() : ''

  if (!/^[\da-f-]{36}$/iu.test(productId)) return json({ error: 'Identificador de producto no válido.' }, 400)
  if (typeof change !== 'number' || !Number.isFinite(change) || change === 0 || Math.abs(change) > 1_000_000) {
    return json({ error: 'El ajuste debe ser una cantidad distinta de cero y dentro del límite permitido.' }, 400)
  }
  if (reason.length < 1 || reason.length > 300) return json({ error: 'El motivo debe tener entre 1 y 300 caracteres.' }, 400)

  const product = await env.DB.prepare(`
    SELECT id, name, quantity
    FROM products
    WHERE id = ?1 AND tenant_id = ?2
    LIMIT 1
  `).bind(productId, session.tenantId).first<ProductStock>()
  if (!product) return json({ error: 'No se encontró el producto.' }, 404)

  const nextQuantity = product.quantity + change
  if (nextQuantity < 0) return json({ error: 'La salida supera las existencias disponibles.' }, 409)
  const now = new Date().toISOString()
  const movementId = crypto.randomUUID()

  const result = await env.DB.batch([
    env.DB.prepare(`
      UPDATE products
      SET quantity = ?1, updated_at = ?2
      WHERE id = ?3 AND tenant_id = ?4 AND quantity = ?5
    `).bind(nextQuantity, now, product.id, session.tenantId, product.quantity),
    env.DB.prepare(`
      INSERT INTO stock_movements (
        id, tenant_id, product_id, user_id, quantity_change,
        quantity_before, quantity_after, reason, created_at
      )
      SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9
      WHERE changes() = 1
    `).bind(movementId, session.tenantId, product.id, session.userId, change, product.quantity, nextQuantity, reason, now),
  ])

  if (result[0].meta.changes !== 1 || result[1].meta.changes !== 1) {
    return json({ error: 'El inventario cambió durante el ajuste. Actualiza la lista e inténtalo otra vez.' }, 409)
  }

  return json({
    movement: {
      id: movementId,
      productId,
      quantityChange: change,
      quantityBefore: product.quantity,
      quantityAfter: nextQuantity,
      reason,
      createdAt: now,
    },
  }, 201)
}
