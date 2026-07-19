import { Filesystem, Directory } from '@capacitor/filesystem'
import type { BackupService, PickedBackupFile } from './types'

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export function createNativeBackupService(): BackupService {
  return {
    async writeArchive(bytes, filename) {
      const path = `backups/${filename}`
      try {
        await Filesystem.mkdir({ path: 'backups', directory: Directory.Cache, recursive: true })
      } catch {
        // already exists
      }
      await Filesystem.writeFile({
        path,
        directory: Directory.Cache,
        data: bytesToBase64(bytes),
      })
      const { uri } = await Filesystem.getUri({ path, directory: Directory.Cache })
      return { path: uri }
    },

    async pickArchive() {
      // Capacitor core has no built-in generic document picker; without an
      // extra plugin, the browser-style <input type="file"> element still
      // works inside the native WebView shell and opens the platform's
      // native file/document picker UI on both iOS and Android.
      return new Promise<PickedBackupFile | null>((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.zip,application/zip'
        input.onchange = async () => {
          const file = input.files?.[0]
          if (!file) {
            resolve(null)
            return
          }
          const buffer = await file.arrayBuffer()
          resolve({ data: new Uint8Array(buffer), name: file.name })
        }
        input.click()
      })
    },

    async deleteArchive(path) {
      try {
        await Filesystem.deleteFile({ path })
      } catch {
        // already gone
      }
    },
  }
}

export { base64ToBytes }
