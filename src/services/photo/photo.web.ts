import { dexieDb } from '@/db/dexieDb'
import { processImage } from '@/utils/image'
import type { PhotoService, CapturedPhoto, ProcessedPhoto } from './types'

function pickFile(capture: boolean): Promise<CapturedPhoto> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    if (capture) input.capture = 'environment'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) {
        reject(new Error('No photo selected'))
        return
      }
      resolve({ webPath: URL.createObjectURL(file) })
    }
    // No native permission dialog exists on web; a cancelled picker simply
    // never fires onchange, which is treated as a silent no-op by callers.
    input.click()
  })
}

const objectUrlCache = new Map<string, string>()

export function createWebPhotoService(): PhotoService {
  return {
    takePhoto: () => pickFile(true),
    choosePhoto: () => pickFile(false),

    async processAndSave(sourceWebPath, memoryId) {
      const { fullImage, thumbnail } = await processImage(sourceWebPath)
      const photoPath = `photos/${memoryId}.jpg`
      const thumbnailPath = `thumbnails/${memoryId}.jpg`

      await dexieDb.photos.put({ path: photoPath, blob: fullImage })
      await dexieDb.photos.put({ path: thumbnailPath, blob: thumbnail })

      return { photoPath, thumbnailPath } satisfies ProcessedPhoto
    },

    async resolveUrl(path) {
      const cached = objectUrlCache.get(path)
      if (cached) return cached
      const row = await dexieDb.photos.get(path)
      if (!row) throw new Error(`Photo not found for path: ${path}`)
      const url = URL.createObjectURL(row.blob)
      objectUrlCache.set(path, url)
      return url
    },

    async deleteFiles(paths) {
      for (const path of paths) {
        const cached = objectUrlCache.get(path)
        if (cached) {
          URL.revokeObjectURL(cached)
          objectUrlCache.delete(path)
        }
        await dexieDb.photos.delete(path)
      }
    },
  }
}
