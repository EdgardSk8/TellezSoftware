export const MAX_IMAGE_BYTES = 150 * 1024
export const MAX_PRODUCT_IMAGES = 5
export const MAX_IMAGE_DIMENSION = 2000
export const MAX_IMAGE_PIXELS = 4_000_000

export type WebpDimensions = {
  width: number
  height: number
}

function isAscii(bytes: Uint8Array, offset: number, value: string): boolean {
  return [...value].every((character, index) => bytes[offset + index] === character.charCodeAt(0))
}

export function readWebpDimensions(bytes: Uint8Array): WebpDimensions | null {
  if (bytes.length < 25 || !isAscii(bytes, 0, 'RIFF') || !isAscii(bytes, 8, 'WEBP')) return null

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const riffSize = view.getUint32(4, true)
  if (riffSize !== bytes.length - 8) return null

  let offset = 12
  let width = 0
  let height = 0
  let imageChunkFound = false
  let dimensionsFound = false

  while (offset + 8 <= bytes.length) {
    const chunk = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3])
    const chunkSize = view.getUint32(offset + 4, true)
    const dataOffset = offset + 8
    const chunkEnd = dataOffset + chunkSize
    const paddedEnd = chunkEnd + (chunkSize % 2)
    if (chunkEnd > bytes.length || paddedEnd > bytes.length) return null

    if (chunk === 'VP8X') {
      if (chunkSize < 10 || dimensionsFound) return null
      width = 1 + bytes[dataOffset + 4] + (bytes[dataOffset + 5] << 8) + (bytes[dataOffset + 6] << 16)
      height = 1 + bytes[dataOffset + 7] + (bytes[dataOffset + 8] << 8) + (bytes[dataOffset + 9] << 16)
      dimensionsFound = true
    } else if (chunk === 'VP8 ') {
      if (chunkSize < 10 || imageChunkFound
        || bytes[dataOffset + 3] !== 0x9d || bytes[dataOffset + 4] !== 0x01 || bytes[dataOffset + 5] !== 0x2a) return null
      width = (bytes[dataOffset + 6] | (bytes[dataOffset + 7] << 8)) & 0x3fff
      height = (bytes[dataOffset + 8] | (bytes[dataOffset + 9] << 8)) & 0x3fff
      imageChunkFound = true
      dimensionsFound = true
    } else if (chunk === 'VP8L') {
      if (chunkSize < 5 || imageChunkFound || bytes[dataOffset] !== 0x2f) return null
      width = 1 + ((bytes[dataOffset + 2] & 0x3f) << 8) + bytes[dataOffset + 1]
      height = 1 + ((bytes[dataOffset + 2] & 0xc0) >> 6) + (bytes[dataOffset + 3] << 2) + ((bytes[dataOffset + 4] & 0x0f) << 10)
      imageChunkFound = true
      dimensionsFound = true
    }

    offset = paddedEnd
  }

  if (offset !== bytes.length || !dimensionsFound || !imageChunkFound) return null
  if (width < 1 || height < 1 || width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION
    || width * height > MAX_IMAGE_PIXELS) return null
  return { width, height }
}
