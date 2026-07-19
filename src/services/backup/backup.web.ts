import { dexieDb } from '@/db/dexieDb'
import type { BackupService, PickedBackupFile } from './types'

export function createWebBackupService(): BackupService {
  return {
    async writeArchive(bytes, filename) {
      const blob = new Blob([bytes.slice().buffer], { type: 'application/zip' })
      const path = `backups/${filename}`
      await dexieDb.photos.put({ path, blob })
      return { path }
    },

    async pickArchive() {
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
      await dexieDb.photos.delete(path)
    },
  }
}
