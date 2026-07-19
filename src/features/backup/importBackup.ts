import JSZip from 'jszip'
import { memoryStorageService, photoService } from '@/services'
import { backupManifestSchema, type BackupManifest, type MemoryRecord } from '@/db/schema'
import type { LocalDate } from '@/types/memory'

export class BackupValidationError extends Error {
  constructor(message = 'This backup file could not be read. It may be corrupt or from an unsupported version.') {
    super(message)
    this.name = 'BackupValidationError'
  }
}

export interface ImportPreview {
  manifest: BackupManifest
  zip: JSZip
  totalCount: number
  conflictDates: LocalDate[]
}

export async function loadAndValidateBackup(data: Uint8Array): Promise<ImportPreview> {
  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(data)
  } catch {
    throw new BackupValidationError()
  }

  const metadataFile = zip.file('metadata.json')
  if (!metadataFile) throw new BackupValidationError('This file is missing its metadata and cannot be imported.')

  let parsed: unknown
  try {
    parsed = JSON.parse(await metadataFile.async('string'))
  } catch {
    throw new BackupValidationError()
  }

  const result = backupManifestSchema.safeParse(parsed)
  if (!result.success) throw new BackupValidationError()
  const manifest = result.data

  const existing = await memoryStorageService.listMemories()
  const existingDates = new Set(existing.map((m) => m.date))
  const conflictDates = manifest.memories
    .map((m) => m.date)
    .filter((date) => existingDates.has(date))

  return { manifest, zip, totalCount: manifest.memories.length, conflictDates }
}

export type ConflictResolution = 'skip' | 'replace'

export interface ApplyImportOptions {
  preview: ImportPreview
  /** Resolution per conflicting date; dates without an entry default to 'skip'. */
  resolutions: Record<LocalDate, ConflictResolution>
}

/**
 * Applies an import transactionally: photo files are written first (so a
 * mid-import failure can be rolled back by deleting them), then the full
 * memory set is committed to storage in a single transaction.
 */
export async function applyImport({ preview, resolutions }: ApplyImportOptions): Promise<number> {
  const existing = await memoryStorageService.listMemories()
  const existingByDate = new Map(existing.map((m) => [m.date, m]))

  const writtenPaths: string[] = []
  const finalByDate = new Map(existingByDate)
  let importedCount = 0

  try {
    for (const entry of preview.manifest.memories) {
      const hasConflict = existingByDate.has(entry.date)
      if (hasConflict && (resolutions[entry.date] ?? 'skip') === 'skip') {
        continue
      }

      const zipFile = preview.zip.file(entry.photoPath)
      if (!zipFile) continue
      const blob = await zipFile.async('blob')
      const objectUrl = URL.createObjectURL(blob)
      try {
        const { photoPath, thumbnailPath } = await photoService.processAndSave(objectUrl, entry.id)
        writtenPaths.push(photoPath, thumbnailPath)
        const record: MemoryRecord = {
          ...entry,
          photoPath,
          thumbnailPath,
        }
        finalByDate.set(entry.date, record)
        importedCount++
      } finally {
        URL.revokeObjectURL(objectUrl)
      }
    }

    await memoryStorageService.replaceMemories([...finalByDate.values()])

    if (preview.manifest.settings) {
      await memoryStorageService.updateSettings(preview.manifest.settings)
    }

    return importedCount
  } catch (err) {
    await photoService.deleteFiles(writtenPaths)
    throw err
  }
}
