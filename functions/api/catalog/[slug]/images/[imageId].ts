import { json } from '../../../../_lib/http'

type PublicImage = {
  object_key: string
  content_type: string
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const image = await env.DB.prepare(`
    SELECT i.object_key, i.content_type
    FROM product_images i
    JOIN products p ON p.id = i.product_id AND p.tenant_id = i.tenant_id
    JOIN tenants t ON t.id = p.tenant_id
    WHERE i.id = ?1 AND t.slug = ?2 AND p.quantity > 0 AND p.archived_at IS NULL
    LIMIT 1
  `).bind(params.imageId, params.slug).first<PublicImage>()
  if (!image) return json({ error: 'No se encontró la imagen publicada.' }, 404)

  const object = await env.FILES.get(image.object_key)
  if (!object) {
    console.error('Public product image metadata points to a missing R2 object.', image.object_key)
    return json({ error: 'La imagen no está disponible.' }, 404)
  }
  return new Response(object.body, {
    headers: {
      'Content-Type': image.content_type,
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    },
  })
}
