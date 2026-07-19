import { dexieDb } from '@/db/dexieDb'
import type { ShareService, ShareImageInput } from './types'

export function createWebShareService(): ShareService {
  return {
    async canShare() {
      return typeof navigator !== 'undefined' && 'share' in navigator
    },

    async prepareGeneratedImage(blob, filename) {
      const path = `generated/${filename}`
      await dexieDb.photos.put({ path, blob })
      return { path }
    },

    async cleanupGeneratedImage(path) {
      await dexieDb.photos.delete(path)
    },

    async shareImage({ path, title }: ShareImageInput) {
      const row = await dexieDb.photos.get(path)
      if (!row) throw new Error(`Story image not found: ${path}`)
      const file = new File([row.blob], 'story.png', { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: title ?? "Today's Memory" })
          return { shared: true }
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            return { shared: false }
          }
          throw err
        }
      }

      // Fallback: trigger a browser download so the user can save/upload manually.
      const url = URL.createObjectURL(row.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'todays-memory-story.png'
      a.click()
      URL.revokeObjectURL(url)
      return { shared: true }
    },

    async saveImageToGallery(path) {
      const row = await dexieDb.photos.get(path)
      if (!row) return { saved: false, reason: 'Story image not found.' }
      const url = URL.createObjectURL(row.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'todays-memory-story.png'
      a.click()
      URL.revokeObjectURL(url)
      return {
        saved: true,
        reason: 'Downloaded to your browser downloads (a native gallery is unavailable in the browser preview).',
      }
    },
  }
}
