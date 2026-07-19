export const FULL_IMAGE_MAX_DIMENSION = 1600
export const THUMBNAIL_MAX_DIMENSION = 400
export const FULL_IMAGE_TARGET_BYTES = 1.5 * 1024 * 1024 // ~1.5MB target
export const STORY_WIDTH = 1080
export const STORY_HEIGHT = 1920

export class ImageProcessingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ImageProcessingError'
  }
}

async function loadOrientedBitmap(source: string): Promise<ImageBitmap> {
  const response = await fetch(source)
  const blob = await response.blob()
  try {
    // 'from-image' applies EXIF orientation automatically where supported.
    return await createImageBitmap(blob, { imageOrientation: 'from-image' })
  } catch {
    return await createImageBitmap(blob)
  }
}

function fitDimensions(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  if (width <= maxDimension && height <= maxDimension) return { width, height }
  const scale = maxDimension / Math.max(width, height)
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

function drawToCanvas(bitmap: ImageBitmap, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new ImageProcessingError('Canvas 2D context unavailable')
  ctx.drawImage(bitmap, 0, 0, width, height)
  return canvas
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new ImageProcessingError('toBlob failed'))),
      'image/jpeg',
      quality,
    )
  })
}

/** Resizes + compresses toward a target byte size by stepping JPEG quality down. */
async function compressToTarget(
  canvas: HTMLCanvasElement,
  targetBytes: number,
): Promise<Blob> {
  let quality = 0.9
  let blob = await canvasToBlob(canvas, quality)
  while (blob.size > targetBytes && quality > 0.4) {
    quality -= 0.1
    blob = await canvasToBlob(canvas, quality)
  }
  return blob
}

export interface ProcessedImageResult {
  fullImage: Blob
  thumbnail: Blob
}

/**
 * Corrects EXIF orientation, resizes, and compresses a source image into a
 * diary-ready full image (~1-2MB) and a small thumbnail. Pure canvas logic —
 * safe to call from both native (webPath) and browser (object URL) sources.
 */
export async function processImage(source: string): Promise<ProcessedImageResult> {
  const bitmap = await loadOrientedBitmap(source)
  try {
    const fullSize = fitDimensions(bitmap.width, bitmap.height, FULL_IMAGE_MAX_DIMENSION)
    const fullCanvas = drawToCanvas(bitmap, fullSize.width, fullSize.height)
    const fullImage = await compressToTarget(fullCanvas, FULL_IMAGE_TARGET_BYTES)

    const thumbSize = fitDimensions(bitmap.width, bitmap.height, THUMBNAIL_MAX_DIMENSION)
    const thumbCanvas = drawToCanvas(bitmap, thumbSize.width, thumbSize.height)
    const thumbnail = await canvasToBlob(thumbCanvas, 0.75)

    return { fullImage, thumbnail }
  } finally {
    bitmap.close()
  }
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new ImageProcessingError('Failed to read blob'))
    reader.readAsDataURL(blob)
  })
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',')
  const mimeMatch = header.match(/data:(.*);base64/)
  const mime = mimeMatch?.[1] ?? 'application/octet-stream'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}
