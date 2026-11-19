import { getAuthenticatedSession } from '../../../../_lib/auth'
import { isSameOrigin, json } from '../../../../_lib/http'

type ProductImageObject = {
  object_key: string
  content_type: string
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const session = await getAuthenticatedSession(request, env.DB)
  if (!session) return json({ error: 'Inicia sesión para continuar.' }, 401)

  const image = await env.DB.prepare(`
    SELECT object_key, content_type
    FROM product_images
    WHERE id = ?1 AND product_id = ?2 AND tenant_id = ?3
  `).bind(params.imageId, params.id, session.tenantId).first<ProductImageObject>()
  if (!image) return json({ error: 'No se encontró la imagen.' }, 404)

  const object = await env.FILES.get(image.object_key)
  if (!object) {
    console.error('Product image metadata points to a missing R2 object.', image.object_key)
    return json({ error: 'La imagen del producto no está disponible.' }, 404)
  }
  return new Response(object.body, {
    headers: {
      'Content-Type': image.content_type,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    },
  })
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!isSameOrigin(request)) return json({ error: 'Solicitud de origen no permitido.' }, 403)
  const session = await getAuthenticatedSession(request, env.DB)
  if (!session) return json({ error: 'Inicia sesión para continuar.' }, 401)
  if (!['owner', 'manager'].includes(session.role)) {
    return json({ error: 'No tienes permiso para eliminar imágenes.' }, 403)
  }

  const image = await env.DB.prepare(`
    SELECT object_key
    FROM product_images
    WHERE id = ?1 AND product_id = ?2 AND tenant_id = ?3
  `).bind(params.imageId, params.id, session.tenantId).first<{ object_key: string }>()
  if (!image) return json({ error: 'No se encontró la imagen.' }, 404)

  await env.DB.prepare(`
    DELETE FROM product_images
    WHERE id = ?1 AND product_id = ?2 AND tenant_id = ?3
  `).bind(params.imageId, params.id, session.tenantId).run()

  try {
    await env.FILES.delete(image.object_key)
  } catch (error) {
    console.error('Product image metadata was deleted but its R2 object cleanup failed.', error)
    return json({ error: 'La referencia se eliminó, pero el objeto necesita limpieza.' }, 500)
  }
  return new Response(null, { status: 204 })
}
