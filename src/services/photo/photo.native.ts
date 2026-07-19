import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Capacitor } from '@capacitor/core'
import { processImage, blobToDataUrl } from '@/utils/image'
import { PhotoPermissionDeniedError } from './types'
import type { PhotoService, CapturedPhoto, ProcessedPhoto } from './types'

const PHOTOS_DIR = 'photos'
const THUMBS_DIR = 'thumbnails'

function stripDataUrlPrefix(dataUrl: string): string {
  return dataUrl.slice(dataUrl.indexOf(',') + 1)
}

async function capture(source: CameraSource): Promise<CapturedPhoto> {
  try {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source,
      quality: 90,
      correctOrientation: true,
    })
    if (!photo.webPath) throw new Error('Camera returned no image path')
    return { webPath: photo.webPath }
  } catch (err) {
    const message = err instanceof Error ? err.message.toLowerCase() : ''
    if (message.includes('denied') || message.includes('permission')) {
      throw new PhotoPermissionDeniedError(source === CameraSource.Camera ? 'camera' : 'library')
    }
    throw err
  }
}

async function ensureDir(directory: string) {
  try {
    await Filesystem.mkdir({ path: directory, directory: Directory.Data, recursive: true })
  } catch {
    // already exists
  }
}

export function createNativePhotoService(): PhotoService {
  return {
    takePhoto: () => capture(CameraSource.Camera),
    choosePhoto: () => capture(CameraSource.Photos),

    async processAndSave(sourceWebPath, memoryId) {
      const { fullImage, thumbnail } = await processImage(sourceWebPath)
      await ensureDir(PHOTOS_DIR)
      await ensureDir(THUMBS_DIR)

      const photoPath = `${PHOTOS_DIR}/${memoryId}.jpg`
      const thumbnailPath = `${THUMBS_DIR}/${memoryId}.jpg`

      await Filesystem.writeFile({
        path: photoPath,
        directory: Directory.Data,
        data: stripDataUrlPrefix(await blobToDataUrl(fullImage)),
      })
      await Filesystem.writeFile({
        path: thumbnailPath,
        directory: Directory.Data,
        data: stripDataUrlPrefix(await blobToDataUrl(thumbnail)),
      })

      return { photoPath, thumbnailPath } satisfies ProcessedPhoto
    },

    async resolveUrl(path) {
      const { uri } = await Filesystem.getUri({ path, directory: Directory.Data })
      return Capacitor.convertFileSrc(uri)
    },

    async deleteFiles(paths) {
      await Promise.all(
        paths.map(async (path) => {
          try {
            await Filesystem.deleteFile({ path, directory: Directory.Data })
          } catch {
            // already gone — fine for rollback cleanup
          }
        }),
      )
    },
  }
}
