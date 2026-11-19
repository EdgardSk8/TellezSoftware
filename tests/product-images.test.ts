import assert from 'node:assert/strict'
import test from 'node:test'
import { MAX_IMAGE_BYTES, readWebpDimensions } from '../functions/_lib/product-images.ts'

function riff(chunks: Array<{ name: string; data: number[] }>): Uint8Array {
  const chunkBytes = chunks.flatMap(({ name, data }) => {
    const header = [...name].map((character) => character.charCodeAt(0))
    const size = data.length
    const sizeBytes = [size & 0xff, (size >>> 8) & 0xff, (size >>> 16) & 0xff, (size >>> 24) & 0xff]
    return [...header, ...sizeBytes, ...data, ...(size % 2 ? [0] : [])]
  })
  const body = [...'WEBP'].map((character) => character.charCodeAt(0)).concat(chunkBytes)
  const length = body.length
  return new Uint8Array([
    ...'RIFF'.split('').map((character) => character.charCodeAt(0)),
    length & 0xff,
    (length >>> 8) & 0xff,
    (length >>> 16) & 0xff,
    (length >>> 24) & 0xff,
    ...body,
  ])
}

function losslessImage(width: number, height: number): Uint8Array {
  const w = width - 1
  const h = height - 1
  return riff([{
    name: 'VP8L',
    data: [
      0x2f,
      w & 0xff,
      ((w >>> 8) & 0x3f) | ((h & 0x03) << 6),
      (h >>> 2) & 0xff,
      (h >>> 10) & 0x0f,
      0,
    ],
  }])
}

test('reads dimensions from a lossless WebP and respects the 150 KiB limit', () => {
  assert.deepEqual(readWebpDimensions(losslessImage(128, 64)), { width: 128, height: 64 })
  assert.equal(MAX_IMAGE_BYTES, 153_600)
})

test('rejects invalid signatures, incorrect RIFF lengths, and missing image chunks', () => {
  const valid = losslessImage(32, 32)
  assert.equal(readWebpDimensions(new Uint8Array(valid).fill(0, 0, 4)), null)

  const incorrectLength = new Uint8Array(valid)
  incorrectLength[4] -= 1
  assert.equal(readWebpDimensions(incorrectLength), null)

  const noImage = riff([{ name: 'VP8X', data: [0, 0, 0, 0, 31, 0, 0, 31, 0, 0] }])
  assert.equal(readWebpDimensions(noImage), null)
})

test('rejects dimensions above the dimension and pixel budgets', () => {
  assert.equal(readWebpDimensions(losslessImage(2001, 1)), null)
  assert.deepEqual(readWebpDimensions(losslessImage(2000, 2000)), { width: 2000, height: 2000 })
})
