import { Share } from '@capacitor/share'
import { Filesystem, Directory } from '@capacitor/filesystem'
import type { ShareService, ShareImageInput } from './types'

const GENERATED_DIR = 'generated'

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = () => reject(new Error('Failed to read generated image'))
    reader.readAsDataURL(blob)
  })
}

export function createNativeShareService(): ShareService {
  return {
    async canShare() {
      const { value } = await Share.canShare()
      return value
    },

    async prepareGeneratedImage(blob, filename) {
      try {
        await Filesystem.mkdir({ path: GENERATED_DIR, directory: Directory.Cache, recursive: true })
      } catch {
        // already exists
      }
      const relativePath = `${GENERATED_DIR}/${filename}`
      await Filesystem.writeFile({
        path: relativePath,
        directory: Directory.Cache,
        data: await blobToBase64(blob),
      })
      const { uri } = await Filesystem.getUri({ path: relativePath, directory: Directory.Cache })
      return { path: uri }
    },

    async cleanupGeneratedImage(path) {
      try {
        await Filesystem.deleteFile({ path })
      } catch {
        // already gone
      }
    },

    async shareImage({ path, title }: ShareImageInput) {
      try {
        await Share.share({
          title: title ?? "Today's Memory",
          url: path,
          dialogTitle: 'Share Story',
        })
        return { shared: true }
      } catch (err) {
        // User dismissing the share sheet rejects the promise on some
        // platforms — treat that as a normal cancellation, not an error.
        const message = err instanceof Error ? err.message.toLowerCase() : ''
        if (message.includes('cancel')) return { shared: false }
        throw err
      }
    },

    async saveImageToGallery(path) {
      // Note: true "Save to Photos" requires a dedicated media-library
      // plugin (e.g. a MediaStore/PHPhotoLibrary bridge) which is outside
      // this build's dependency set. As a best-effort fallback we copy the
      // generated image into app-visible Documents storage and point the
      // user at native Share instead, which reliably reaches Photos via the
      // system "Save Image" share-sheet action on both platforms.
      try {
        const data = await Filesystem.readFile({ path })
        const filename = path.split('/').pop() ?? `story-${Date.now()}.png`
        await Filesystem.writeFile({
          path: filename,
          directory: Directory.Documents,
          data: data.data,
        })
        return {
          saved: false,
          reason:
            'Direct photo-library saving needs an additional native plugin. Use Share Story and choose "Save Image" instead.',
        }
      } catch {
        return {
          saved: false,
          reason: 'Could not prepare the image for saving. Try Share Story instead.',
        }
      }
    },
  }
}
