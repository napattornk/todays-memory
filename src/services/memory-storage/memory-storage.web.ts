import { dexieDb, getDexieSetting, setDexieSetting } from '@/db/dexieDb'
import { CURRENT_SCHEMA_VERSION } from '@/db/schema'
import type { MemoryRecord, AppSettingsRecord } from '@/db/schema'
import { DEFAULT_SETTINGS } from '@/types/memory'
import { DuplicateMemoryDateError } from './types'
import type { MemoryStorageService, CreateMemoryInput, UpdateMemoryPatch } from './types'

const SETTINGS_KEY = 'app_settings'

export function createWebMemoryStorageService(): MemoryStorageService {
  return {
    async init() {
      await dexieDb.open()
    },

    async getMemoryByDate(date) {
      const row = await dexieDb.memories.where('date').equals(date).first()
      return row ?? null
    },

    async getMemoryById(id) {
      const row = await dexieDb.memories.get(id)
      return row ?? null
    },

    async listMemories() {
      const rows = await dexieDb.memories.toArray()
      return rows.sort((a, b) => (a.date < b.date ? 1 : -1))
    },

    async createMemory(memory: CreateMemoryInput) {
      const existing = await dexieDb.memories.where('date').equals(memory.date).first()
      if (existing) throw new DuplicateMemoryDateError(memory.date)
      await dexieDb.memories.add(memory)
      return memory
    },

    async updateMemory(id, patch: UpdateMemoryPatch) {
      const current = await dexieDb.memories.get(id)
      if (!current) throw new Error(`Memory not found: ${id}`)
      const updated: MemoryRecord = { ...current, ...patch }
      await dexieDb.memories.put(updated)
      return updated
    },

    async deleteMemory(id) {
      await dexieDb.memories.delete(id)
    },

    async getSettings() {
      return getDexieSetting<AppSettingsRecord>(SETTINGS_KEY, {
        ...DEFAULT_SETTINGS,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      })
    },

    async updateSettings(patch) {
      const current = await this.getSettings()
      const next: AppSettingsRecord = { ...current, ...patch }
      await setDexieSetting(SETTINGS_KEY, next)
      return next
    },

    async replaceMemories(memories) {
      await dexieDb.transaction('rw', dexieDb.memories, async () => {
        for (const memory of memories) {
          await dexieDb.memories.put(memory)
        }
      })
    },

    async deleteAllData() {
      await dexieDb.memories.clear()
      await dexieDb.settings.clear()
      await dexieDb.photos.clear()
    },
  }
}
