import { beforeEach, describe, expect, it, vi } from 'vitest'
import JSZip from 'jszip'
import { dexieDb } from '@/db/dexieDb'
import { CURRENT_SCHEMA_VERSION } from '@/db/schema'
import { loadAndValidateBackup, applyImport, BackupValidationError } from './importBackup'

// jsdom has no real Canvas/createImageBitmap implementation, so the photo
// pipeline is stubbed here — this suite exercises conflict-resolution and
// transactional import logic, not image processing (covered separately).
vi.mock('@/services', async () => {
  const { createWebMemoryStorageService } = await import('@/services/memory-storage/memory-storage.web')
  return {
    memoryStorageService: createWebMemoryStorageService(),
    photoService: {
      async processAndSave(_source: string, memoryId: string) {
        return { photoPath: `photos/${memoryId}.jpg`, thumbnailPath: `thumbnails/${memoryId}.jpg` }
      },
      async deleteFiles() {},
    },
  }
})

function makeMemoryEntry(date: string) {
  const now = new Date().toISOString()
  return {
    id: `mem-${date}`,
    date,
    type: 'daily' as const,
    photoPath: `photos/mem-${date}.jpg`,
    thumbnailPath: `photos/mem-${date}.jpg`,
    promptTextSnapshot: 'A prompt',
    createdAt: now,
    updatedAt: now,
    addedAt: now,
  }
}

// A minimal 1x1 JPEG-ish blob is enough for Canvas to decode in jsdom's mocked pipeline.
async function makeZip(dates: string[]): Promise<Uint8Array> {
  const zip = new JSZip()
  const photos = zip.folder('photos')!
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
  for (const date of dates) {
    photos.file(`mem-${date}.jpg`, pngBase64, { base64: true })
  }
  const manifest = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    memories: dates.map(makeMemoryEntry),
  }
  zip.file('metadata.json', JSON.stringify(manifest))
  return zip.generateAsync({ type: 'uint8array' })
}

beforeEach(async () => {
  await dexieDb.memories.clear()
  await dexieDb.photos.clear()
})

describe('loadAndValidateBackup', () => {
  it('rejects a corrupt/non-zip file', async () => {
    await expect(loadAndValidateBackup(new Uint8Array([1, 2, 3]))).rejects.toBeInstanceOf(
      BackupValidationError,
    )
  })

  it('rejects a zip with no metadata.json', async () => {
    const zip = new JSZip()
    zip.file('readme.txt', 'not a backup')
    const bytes = await zip.generateAsync({ type: 'uint8array' })
    await expect(loadAndValidateBackup(bytes)).rejects.toBeInstanceOf(BackupValidationError)
  })

  it('parses a valid backup and reports zero conflicts against an empty store', async () => {
    const bytes = await makeZip(['2026-01-01', '2026-01-02'])
    const preview = await loadAndValidateBackup(bytes)
    expect(preview.totalCount).toBe(2)
    expect(preview.conflictDates).toEqual([])
  })

  it('detects a conflicting date already present locally', async () => {
    const { memoryStorageService } = await import('@/services')
    await memoryStorageService.createMemory(makeMemoryEntry('2026-01-01'))
    const bytes = await makeZip(['2026-01-01', '2026-01-02'])
    const preview = await loadAndValidateBackup(bytes)
    expect(preview.conflictDates).toEqual(['2026-01-01'])
  })
})

describe('applyImport', () => {
  it('skips conflicting dates by default', async () => {
    const { memoryStorageService } = await import('@/services')
    const existing = makeMemoryEntry('2026-01-01')
    await memoryStorageService.createMemory({ ...existing, caption: 'original' })

    const bytes = await makeZip(['2026-01-01', '2026-01-02'])
    const preview = await loadAndValidateBackup(bytes)
    await applyImport({ preview, resolutions: { '2026-01-01': 'skip' } })

    const kept = await memoryStorageService.getMemoryByDate('2026-01-01')
    expect(kept?.caption).toBe('original')
    const added = await memoryStorageService.getMemoryByDate('2026-01-02')
    expect(added).not.toBeNull()
  })

  it('replaces conflicting dates when requested', async () => {
    const { memoryStorageService } = await import('@/services')
    const existing = makeMemoryEntry('2026-01-01')
    await memoryStorageService.createMemory({ ...existing, caption: 'original' })

    const bytes = await makeZip(['2026-01-01'])
    const preview = await loadAndValidateBackup(bytes)
    await applyImport({ preview, resolutions: { '2026-01-01': 'replace' } })

    const replaced = await memoryStorageService.getMemoryByDate('2026-01-01')
    expect(replaced?.id).toBe('mem-2026-01-01')
  })
})
