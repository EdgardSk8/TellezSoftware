import { getAuthenticatedSession } from '../../../_lib/auth'
import { json, isSameOrigin } from '../../../_lib/http'
import {
  MAX_IMAGE_BYTES,
  MAX_PRODUCT_IMAGES,
  readWebpDimensions,
} from '../../../_lib/product-images'

type ProductImageRow = {
  id: string
  object_key: string
  content_type: string
  size_bytes: number
  width: number
  height: number
  position: number
  created_at: string
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const session = await getAuthenticatedSession(request, env.DB)
  if (!session) return json({ error: 'Inicia sesión para continuar.' }, 401)

  const product = await env.DB.prepare(
    'SELECT id FROM products WHERE id = ?1 AND tenant_id = ?2',
  ).bind(params.id, session.tenantId).first<{ id: string }>()
  if (!product) return json({ error: 'No se encontró el producto.' }, 404)

  const { results } = await env.DB.prepare(`
    SELECT id, object_key, content_type, size_bytes, width, height, position, created_at
    FROM product_images
    WHERE tenant_id = ?1 AND product_id = ?2
    ORDER BY position ASC
  `).bind(session.tenantId, product.id).all<ProductImageRow>()

  return json({
    items: results.map(({ id, content_type, size_bytes, width, height, position, created_at }) => ({
      id,
      contentType: content_type,
      sizeBytes: size_bytes,
      width,
      height,
      position,
      createdAt: created_at,
      url: `/api/products/${encodeURIComponent(product.id)}/images/${encodeURIComponent(id)}`,
    })),
  })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!isSameOrigin(request)) return json({ error: 'Solicitud de origen no permitido.' }, 403)
  const session = await getAuthenticatedSession(request, env.DB)
  if (!session) return json({ error: 'Inicia sesión para continuar.' }, 401)
  if (!['owner', 'manager'].includes(session.role)) {
    return json({ error: 'No tienes permiso para cargar imágenes.' }, 403)
  }

  const product = await env.DB.prepare(
    'SELECT id FROM products WHERE id = ?1 AND tenant_id = ?2',
  ).bind(params.id, session.tenantId).first<{ id: string }>()
  if (!product) return json({ error: 'No se encontró el producto.' }, 404)

  const contentType = request.headers.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase()
  if (contentType !== 'image/webp') {
    return json({ error: 'La imagen debe estar optimizada en formato WebP.' }, 415)
  }
  const contentLength = Number(request.headers.get('Content-Length') ?? 0)
  if (contentLength > MAX_IMAGE_BYTES) {
    return json({ error: 'La imagen WebP no puede superar 150 KiB.' }, 413)
  }

  const reader = request.body?.getReader()
  if (!reader) return json({ error: 'El archivo de imagen está vacío.' }, 400)
  const chunks: Uint8Array[] = []
  let totalBytes = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    totalBytes += value.byteLength
    if (totalBytes > MAX_IMAGE_BYTES) {
      await reader.cancel()
      return json({ error: 'La imagen WebP no puede superar 150 KiB.' }, 413)
    }
    chunks.push(value)
  }
  if (totalBytes < 1) {
    return json({ error: 'El archivo de imagen está vacío.' }, 400)
  }
  const bytes = new Uint8Array(totalBytes)
  let byteOffset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, byteOffset)
    byteOffset += chunk.byteLength
  }
  if (bytes.length > MAX_IMAGE_BYTES) {
    return json({ error: 'La imagen WebP no puede superar 150 KiB.' }, 413)
  }
  const dimensions = readWebpDimensions(bytes)
  if (!dimensions) {
    return json({ error: 'El archivo no es un WebP válido o supera las dimensiones permitidas.' }, 400)
  }

  const currentCount = await env.DB.prepare(
    'SELECT COUNT(*) AS count FROM product_images WHERE tenant_id = ?1 AND product_id = ?2',
  ).bind(session.tenantId, product.id).first<{ count: number }>()
  if ((currentCount?.count ?? 0) >= MAX_PRODUCT_IMAGES) {
    return json({ error: 'Cada producto puede tener como máximo 5 imágenes.' }, 409)
  }

  const nextPosition = await env.DB.prepare(`
    SELECT COALESCE(MAX(position), -1) + 1 AS position
    FROM product_images
    WHERE tenant_id = ?1 AND product_id = ?2
  `).bind(session.tenantId, product.id).first<{ position: number }>()
  const imageId = crypto.randomUUID()
  const objectKey = `tenants/${session.tenantId}/products/${product.id}/${imageId}.webp`
  const createdAt = new Date().toISOString()

  await env.FILES.put(objectKey, bytes, {
    httpMetadata: { contentType: 'image/webp' },
    customMetadata: { tenantId: session.tenantId, productId: product.id },
  })

  try {
    await env.DB.prepare(`
      INSERT INTO product_images (
        id, tenant_id, product_id, object_key, content_type, size_bytes,
        width, height, position, created_at
      ) VALUES (?1, ?2, ?3, ?4, 'image/webp', ?5, ?6, ?7, ?8, ?9)
    `).bind(
      imageId,
      session.tenantId,
      product.id,
      objectKey,
      bytes.length,
      dimensions.width,
      dimensions.height,
      nextPosition?.position ?? currentCount?.count ?? 0,
      createdAt,
    ).run()
  } catch (error) {
    try {
      await env.FILES.delete(objectKey)
    } catch (cleanupError) {
      console.error('Could not remove an unassociated R2 product image.', cleanupError)
    }
    console.error('Could not associate uploaded product image in D1.', error)
    return json({ error: 'No se pudo asociar la imagen al producto.' }, 500)
  }

  return json({
    id: imageId,
    contentType: 'image/webp',
    sizeBytes: bytes.length,
    width: dimensions.width,
    height: dimensions.height,
    position: nextPosition?.position ?? currentCount?.count ?? 0,
    createdAt,
    url: `/api/products/${encodeURIComponent(product.id)}/images/${encodeURIComponent(imageId)}`,
  }, 201)
}
