import JSZip from 'jszip'
import { memoryStorageService, photoService } from '@/services'
import { CURRENT_SCHEMA_VERSION } from '@/db/schema'
import type { BackupManifest } from '@/db/schema'

export async function buildBackupArchive(): Promise<Uint8Array> {
  const memories = await memoryStorageService.listMemories()
  const settings = await memoryStorageService.getSettings()
  const zip = new JSZip()
  const photosFolder = zip.folder('photos')!

  const manifestMemories = await Promise.all(
    memories.map(async (memory) => {
      const url = await photoService.resolveUrl(memory.photoPath)
      const blob = await (await fetch(url)).blob()
      const zipPath = `${memory.id}.jpg`
      photosFolder.file(zipPath, blob)
      return { ...memory, photoPath: `photos/${zipPath}`, thumbnailPath: `photos/${zipPath}` }
    }),
  )

  const manifest: BackupManifest = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    memories: manifestMemories,
    settings,
  }

  zip.file('metadata.json', JSON.stringify(manifest, null, 2))
  return zip.generateAsync({ type: 'uint8array' })
}

export function backupFilename(): string {
  const stamp = new Date().toISOString().slice(0, 10)
  return `todays-memory-backup-${stamp}.zip`
}
