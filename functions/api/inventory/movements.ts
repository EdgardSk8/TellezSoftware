import { getAuthenticatedSession } from '../../_lib/auth'
import { json } from '../../_lib/http'

type MovementRow = {
  id: string
  product_id: string
  product_name: string
  quantity_change: number
  quantity_before: number
  quantity_after: number
  reason: string
  created_at: string
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const session = await getAuthenticatedSession(request, env.DB)
  if (!session) return json({ error: 'Inicia sesión para continuar.' }, 401)

  const rawLimit = new URL(request.url).searchParams.get('limit')
  const limit = rawLimit === null ? 25 : Number(rawLimit)
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return json({ error: 'El límite debe estar entre 1 y 100.' }, 400)
  }

  const { results } = await env.DB.prepare(`
    SELECT stock_movements.id, stock_movements.product_id, products.name AS product_name,
           stock_movements.quantity_change, stock_movements.quantity_before,
           stock_movements.quantity_after, stock_movements.reason, stock_movements.created_at
    FROM stock_movements
    JOIN products
      ON products.id = stock_movements.product_id
     AND products.tenant_id = stock_movements.tenant_id
    WHERE stock_movements.tenant_id = ?1
    ORDER BY stock_movements.created_at DESC, stock_movements.id DESC
    LIMIT ?2
  `).bind(session.tenantId, limit).all<MovementRow>()

  return json({
    items: results.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      change: item.quantity_change,
      before: item.quantity_before,
      after: item.quantity_after,
      reason: item.reason,
      createdAt: item.created_at,
    })),
  })
}
