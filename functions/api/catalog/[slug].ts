import { json } from '../../_lib/http'

type TenantRow = {
  id: string
  name: string
  currency: string
}

type PublicProductRow = {
  id: string
  name: string
  category: string
  price: number
  unit: string
  variant: string | null
  created_at: string
  image_id: string | null
}

type Cursor = { createdAt: string; id: string }

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

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  if (typeof params.slug !== 'string') return json({ error: 'La tienda solicitada no es válida.' }, 400)
  const slug = params.slug
  const tenant = await env.DB.prepare(`
    SELECT id, name, currency
    FROM tenants
    WHERE slug = ?1
    LIMIT 1
  `).bind(slug).first<TenantRow>()
  if (!tenant) return json({ error: 'No encontramos esta tienda.' }, 404)

  const url = new URL(request.url)
  const cursor = decodeCursor(url.searchParams.get('cursor'))
  if (cursor === false) return json({ error: 'Cursor de paginación no válido.' }, 400)

  const rows = await env.DB.prepare(`
    SELECT p.id, p.name, p.category, p.price, p.unit, p.variant, p.created_at,
      (SELECT i.id FROM product_images i
        WHERE i.tenant_id = p.tenant_id AND i.product_id = p.id
        ORDER BY i.position ASC LIMIT 1) AS image_id
    FROM products p
    WHERE p.tenant_id = ?1
      AND p.quantity > 0
      AND p.archived_at IS NULL
      AND (?2 IS NULL OR p.created_at < ?2 OR (p.created_at = ?2 AND p.id < ?3))
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT 51
  `).bind(tenant.id, cursor?.createdAt ?? null, cursor?.id ?? null).all<PublicProductRow>()

  const hasMore = rows.results.length > 50
  const items = hasMore ? rows.results.slice(0, 50) : rows.results
  const last = items.at(-1)
  return json({
    store: { name: tenant.name, currency: tenant.currency },
    items: items.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      unit: product.unit,
      variant: product.variant,
      imageUrl: product.image_id
        ? `/api/catalog/${encodeURIComponent(slug)}/images/${encodeURIComponent(product.image_id)}`
        : null,
    })),
    nextCursor: hasMore && last ? encodeCursor({ createdAt: last.created_at, id: last.id }) : null,
  }, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=300' })
}
