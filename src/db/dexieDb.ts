import Dexie, { type EntityTable } from 'dexie'
import type { MemoryRecord, AppSettingsRecord } from '@/db/schema'

/**
 * Browser-only development fallback. Mirrors the SQLite schema so
 * MemoryStorageService.web.ts can implement the same interface as the
 * native SQLite implementation. Never used on iOS/Android.
 */
export class TodaysMemoryDexieDb extends Dexie {
  memories!: EntityTable<MemoryRecord, 'id'>
  settings!: EntityTable<{ key: string; value: string }, 'key'>
  photos!: EntityTable<{ path: string; blob: Blob }, 'path'>

  constructor() {
    super('todays-memory')
    this.version(1).stores({
      memories: 'id, date, type',
      settings: 'key',
      photos: 'path',
    })
  }
}

export const dexieDb = new TodaysMemoryDexieDb()

export async function getDexieSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await dexieDb.settings.get(key)
  if (!row) return fallback
  try {
    return JSON.parse(row.value) as T
  } catch {
    return fallback
  }
}

export async function setDexieSetting(key: string, value: unknown): Promise<void> {
  await dexieDb.settings.put({ key, value: JSON.stringify(value) })
}

export type { AppSettingsRecord }
