import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

const baseUrl = process.env.LOCAL_PAGES_URL ?? 'http://localhost:8788'
const email = process.env.LOCAL_TEST_EMAIL
const password = process.env.LOCAL_TEST_PASSWORD
if (!email || !password) {
  throw new Error('Set LOCAL_TEST_EMAIL and LOCAL_TEST_PASSWORD for a test-only local account.')
}

const origin = new URL(baseUrl).origin
const webpBytes = Uint8Array.from(atob(
  'UklGRkgCAABXRUJQVlA4WAoAAAAgAAAAfwAAfwAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggWgAAAPAGAJ0BKoAAgAA+YTCWSKQjIiEgiACADAlpbuF0mXAfgAABWdiLxBUc9sReIKjntiLxBUc9sReIKjntiLxBT0AA/v5XK///CrcMQzVf//KVeCxub4AAAAAAAA==',
), (character) => character.charCodeAt(0))

async function request(path, { method = 'GET', body, cookie, contentType } = {}) {
  const headers = { Origin: origin }
  if (cookie) headers.Cookie = cookie
  if (contentType) headers['Content-Type'] = contentType
  else if (body && typeof body === 'object' && !(body instanceof Uint8Array)) headers['Content-Type'] = 'application/json'
  const response = await fetch(new URL(path, baseUrl), {
    method,
    headers,
    body: body && typeof body === 'object' && !(body instanceof Uint8Array) ? JSON.stringify(body) : body,
  })
  return response
}

let productId
let paginationProductId
let imageId
let cookie
let testFailure

try {
  const registrationWithoutAcceptance = await request('/api/auth/register', {
    method: 'POST',
    body: {
      email: `terms-check-${randomUUID()}@localhost.test`,
      password: 'LocalTestPassword123!',
      tenantName: 'Terms acceptance check',
      businessType: 'general',
      currency: 'NIO',
    },
  })
  assert.equal(registrationWithoutAcceptance.status, 400, 'registration must require acceptance of the current terms version')

  const invalidBusinessType = await request('/api/auth/register', {
    method: 'POST',
    body: {
      email: `business-type-check-${randomUUID()}@localhost.test`,
      password: 'LocalTestPassword123!',
      tenantName: 'Business type validation',
      businessType: 'unknown',
      currency: 'NIO',
      acceptedTermsVersion: '2026-11-14',
    },
  })
  assert.equal(invalidBusinessType.status, 400, 'registration must reject unsupported business types')

  const login = await request('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  })
  assert.equal(login.status, 200, 'local test user login should succeed')
  const setCookie = login.headers.get('set-cookie')
  assert.ok(setCookie, 'login should issue a session cookie')
  const cookieMatch = /(__Host-tellez-session=[^;]+)/u.exec(setCookie)
  assert.ok(cookieMatch, 'login cookie should have the expected name')
  cookie = cookieMatch[1]

  const sessionResponse = await request('/api/auth/me', { cookie })
  assert.equal(sessionResponse.status, 200)
  const session = await sessionResponse.json()
  assert.equal(typeof session.tenant.slug, 'string')
  assert.equal(typeof session.tenant.businessType, 'string')
  const workspacesResponse = await request('/api/workspaces', { cookie })
  assert.equal(workspacesResponse.status, 200)
  const workspaceList = await workspacesResponse.json()
  assert.ok(workspaceList.items.some((workspace) => workspace.id === session.tenant.id))
  const unauthorizedWorkspaceSwitch = await request('/api/workspaces/switch', {
    method: 'POST',
    cookie,
    body: { workspaceId: randomUUID() },
  })
  assert.equal(unauthorizedWorkspaceSwitch.status, 403, 'workspace switching must require an existing membership')

  const sku = `LOCAL-QA-${randomUUID()}`
  const created = await request('/api/products', {
    method: 'POST',
    cookie,
    body: {
      name: 'Temporary local API verification',
      sku,
      category: 'Automated QA',
      profile: session.tenant.profile === 'clothing' ? 'solid_goods' : 'clothing',
      unit: 'unidad',
      quantity: 3,
      minStock: 1,
      cost: 10,
      price: 25,
    },
  })
  assert.equal(created.status, 201)
  const createdProduct = await created.json()
  productId = createdProduct.id
  assert.equal(createdProduct.profile, session.tenant.profile, 'new products must use the active business inventory profile')

  const secondProduct = await request('/api/products', {
    method: 'POST',
    cookie,
    body: {
      name: 'Temporary local pagination verification',
      sku: `${sku}-PAGE`,
      category: 'Automated QA',
      profile: session.tenant.profile,
      unit: 'unidad',
      quantity: 0,
    },
  })
  assert.equal(secondProduct.status, 201)
  paginationProductId = (await secondProduct.json()).id

  const updated = await request(`/api/products/${productId}`, {
    method: 'PATCH',
    cookie,
    body: { name: 'Updated local API verification', price: 27, quantity: 999 },
  })
  assert.equal(updated.status, 200)
  const updatedProduct = await updated.json()
  assert.equal(updatedProduct.price, 27)
  assert.equal(updatedProduct.quantity, 3, 'stock must change only through audited inventory adjustments')
  assert.equal(updatedProduct.profile, createdProduct.profile)

  const listed = await request(`/api/products?limit=25&q=${encodeURIComponent(`${sku}-PAGE`)}`, { cookie })
  assert.equal(listed.status, 200)
  const list = await listed.json()
  assert.equal(list.total, 1)

  const firstPageUrl = new URL('/api/products', baseUrl)
  firstPageUrl.searchParams.set('limit', '1')
  firstPageUrl.searchParams.set('q', sku)
  const firstPageResponse = await request(`${firstPageUrl.pathname}${firstPageUrl.search}`, { cookie })
  assert.equal(firstPageResponse.status, 200)
  const firstPage = await firstPageResponse.json()
  assert.equal(firstPage.total, 2)
  assert.equal(firstPage.items.length, 1)
  assert.ok(firstPage.nextCursor)

  const secondPageUrl = new URL('/api/products', baseUrl)
  secondPageUrl.searchParams.set('limit', '1')
  secondPageUrl.searchParams.set('q', sku)
  secondPageUrl.searchParams.set('cursor', firstPage.nextCursor)
  const secondPageResponse = await request(`${secondPageUrl.pathname}${secondPageUrl.search}`, { cookie })
  assert.equal(secondPageResponse.status, 200)
  const secondPageData = await secondPageResponse.json()
  assert.equal(secondPageData.items.length, 1)
  assert.notEqual(firstPage.items[0].id, secondPageData.items[0].id)
  assert.equal(secondPageData.nextCursor, null)

  const oversized = await request(`/api/products/${productId}/images`, {
    method: 'POST',
    cookie,
    contentType: 'image/webp',
    body: new Uint8Array(153_601),
  })
  assert.equal(oversized.status, 413)

  const uploaded = await request(`/api/products/${productId}/images`, {
    method: 'POST',
    cookie,
    contentType: 'image/webp',
    body: webpBytes,
  })
  assert.equal(uploaded.status, 201)
  const image = await uploaded.json()
  imageId = image.id
  assert.ok(image.sizeBytes <= 153_600)
  assert.equal(image.contentType, 'image/webp')
  assert.deepEqual({ width: image.width, height: image.height }, { width: 128, height: 128 })

  const privateImageWithoutSession = await request(`/api/products/${productId}/images/${imageId}`)
  assert.equal(privateImageWithoutSession.status, 401)
  const privateImage = await request(`/api/products/${productId}/images/${imageId}`, { cookie })
  assert.equal(privateImage.status, 200)
  assert.equal(privateImage.headers.get('content-type'), 'image/webp')

  const catalogResponse = await request(`/api/catalog/${session.tenant.slug}`)
  assert.equal(catalogResponse.status, 200)
  const catalog = await catalogResponse.json()
  const catalogProduct = catalog.items.find((item) => item.id === productId)
  assert.ok(catalogProduct, 'in-stock product should be visible in the public catalog')
  for (const privateField of ['sku', 'quantity', 'cost', 'serial', 'tenantId']) {
    assert.equal(privateField in catalogProduct, false)
  }
  const publicImage = await request(catalogProduct.imageUrl)
  assert.equal(publicImage.status, 200)

  const archived = await request(`/api/products/${productId}`, {
    method: 'PATCH',
    cookie,
    body: { archived: true },
  })
  assert.equal(archived.status, 200)
  const archivedCatalog = await (await request(`/api/catalog/${session.tenant.slug}`)).json()
  assert.equal(archivedCatalog.items.some((item) => item.id === productId), false)
  assert.equal((await request(catalogProduct.imageUrl)).status, 404)

  const restored = await request(`/api/products/${productId}`, {
    method: 'PATCH',
    cookie,
    body: { archived: false },
  })
  assert.equal(restored.status, 200)
  const deletedImage = await request(`/api/products/${productId}/images/${imageId}`, {
    method: 'DELETE',
    cookie,
  })
  assert.equal(deletedImage.status, 204)
  imageId = undefined
} catch (error) {
  testFailure = error
  throw error
} finally {
  if (cookie && imageId && productId) {
    const cleanupImage = await request(`/api/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
      cookie,
    })
    if (!cleanupImage.ok && cleanupImage.status !== 404) {
      console.error('Could not clean up the temporary local R2 test image.', cleanupImage.status)
    }
  }
  if (cookie && productId) {
    const cleanupProduct = await request(`/api/products/${productId}`, {
      method: 'PATCH',
      cookie,
      body: { archived: true },
    })
    if (!cleanupProduct.ok && cleanupProduct.status !== 404) {
      console.error('Could not archive the temporary local test product.', cleanupProduct.status)
    }
    if (cookie && paginationProductId) {
      const cleanupProduct = await request(`/api/products/${paginationProductId}`, {
        method: 'PATCH',
        cookie,
        body: { archived: true },
      })
      if (!cleanupProduct.ok && cleanupProduct.status !== 404) {
        console.error('Could not archive the temporary local pagination product.', cleanupProduct.status)
      }
    }
  }
  if (testFailure) console.error('Local API smoke test failed; temporary records were cleaned where possible.')
}

console.log('Local Pages API, workspace membership, active-business product profile, product lifecycle, cursor pagination, image validation, private access, and public catalog checks passed.')
