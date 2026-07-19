import { beforeEach, describe, expect, it } from 'vitest'
import { dexieDb } from '@/db/dexieDb'
import { createWebMemoryStorageService } from './memory-storage.web'
import { DuplicateMemoryDateError } from './types'
import type { MemoryRecord } from '@/db/schema'

function makeMemory(overrides: Partial<MemoryRecord> = {}): MemoryRecord {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    date: '2026-07-19',
    type: 'daily',
    photoPath: 'photos/a.jpg',
    thumbnailPath: 'thumbnails/a.jpg',
    createdAt: now,
    updatedAt: now,
    addedAt: now,
    ...overrides,
  }
}

beforeEach(async () => {
  await dexieDb.memories.clear()
  await dexieDb.settings.clear()
})

describe('MemoryStorageService (web/Dexie fallback)', () => {
  it('creates and retrieves a memory by date', async () => {
    const service = createWebMemoryStorageService()
    const memory = makeMemory()
    await service.createMemory(memory)
    const found = await service.getMemoryByDate(memory.date)
    expect(found?.id).toBe(memory.id)
  })

  it('enforces one memory per date', async () => {
    const service = createWebMemoryStorageService()
    await service.createMemory(makeMemory({ date: '2026-07-19' }))
    await expect(
      service.createMemory(makeMemory({ date: '2026-07-19' })),
    ).rejects.toBeInstanceOf(DuplicateMemoryDateError)
  })

  it('updates a caption without touching the photo paths', async () => {
    const service = createWebMemoryStorageService()
    const memory = makeMemory()
    await service.createMemory(memory)
    const updated = await service.updateMemory(memory.id, { caption: 'A quiet Sunday.' })
    expect(updated.caption).toBe('A quiet Sunday.')
    expect(updated.photoPath).toBe(memory.photoPath)
  })

  it('deletes a memory', async () => {
    const service = createWebMemoryStorageService()
    const memory = makeMemory()
    await service.createMemory(memory)
    await service.deleteMemory(memory.id)
    expect(await service.getMemoryById(memory.id)).toBeNull()
  })

  it('persists settings updates', async () => {
    const service = createWebMemoryStorageService()
    const updated = await service.updateSettings({ morningReminderEnabled: false })
    expect(updated.morningReminderEnabled).toBe(false)
    expect(await service.getSettings()).toMatchObject({ morningReminderEnabled: false })
  })
})
