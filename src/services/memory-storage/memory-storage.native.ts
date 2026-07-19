import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from '@capacitor-community/sqlite'
import { CURRENT_SCHEMA_VERSION } from '@/db/schema'
import type { MemoryRecord, AppSettingsRecord } from '@/db/schema'
import { DEFAULT_SETTINGS } from '@/types/memory'
import { migrationsAfter } from '@/db/migrations'
import { rowToMemory, memoryToRowParams, type MemoryRow } from '@/db/rowMapper'
import { DuplicateMemoryDateError } from './types'
import type { MemoryStorageService, CreateMemoryInput, UpdateMemoryPatch } from './types'

const DB_NAME = 'todaysmemory'
const SETTINGS_KEY = 'app_settings'

export function createNativeMemoryStorageService(): MemoryStorageService {
  const connection = new SQLiteConnection(CapacitorSQLite)
  let db: SQLiteDBConnection | null = null

  async function getDb(): Promise<SQLiteDBConnection> {
    if (db) return db
    const isConn = (await connection.isConnection(DB_NAME, false)).result
    db = isConn
      ? await connection.retrieveConnection(DB_NAME, false)
      : await connection.createConnection(DB_NAME, false, 'no-encryption', 1, false)
    await db.open()
    return db
  }

  async function runMigrations(handle: SQLiteDBConnection) {
    let currentVersion = 0
    try {
      const res = await handle.query('SELECT version FROM schema_meta WHERE id = 1')
      currentVersion = res.values?.[0]?.version ?? 0
    } catch {
      // schema_meta doesn't exist yet — fresh database, currentVersion stays 0
    }
    const pending = migrationsAfter(currentVersion)
    for (const migration of pending) {
      await handle.execute(migration.statements.join(';'))
      await handle.run('UPDATE schema_meta SET version = ? WHERE id = 1', [migration.version])
    }
  }

  async function readSettingsRow(handle: SQLiteDBConnection): Promise<AppSettingsRecord> {
    const res = await handle.query('SELECT value FROM settings WHERE key = ?', [SETTINGS_KEY])
    const raw = res.values?.[0]?.value
    if (!raw) return { ...DEFAULT_SETTINGS, schemaVersion: CURRENT_SCHEMA_VERSION }
    return JSON.parse(raw) as AppSettingsRecord
  }

  return {
    async init() {
      const handle = await getDb()
      await runMigrations(handle)
    },

    async getMemoryByDate(date) {
      const handle = await getDb()
      const res = await handle.query('SELECT * FROM memories WHERE date = ?', [date])
      const row = res.values?.[0] as MemoryRow | undefined
      return row ? rowToMemory(row) : null
    },

    async getMemoryById(id) {
      const handle = await getDb()
      const res = await handle.query('SELECT * FROM memories WHERE id = ?', [id])
      const row = res.values?.[0] as MemoryRow | undefined
      return row ? rowToMemory(row) : null
    },

    async listMemories() {
      const handle = await getDb()
      const res = await handle.query('SELECT * FROM memories ORDER BY date DESC')
      return ((res.values ?? []) as MemoryRow[]).map(rowToMemory)
    },

    async createMemory(memory: CreateMemoryInput) {
      const handle = await getDb()
      const existing = await handle.query('SELECT id FROM memories WHERE date = ?', [memory.date])
      if ((existing.values ?? []).length > 0) {
        throw new DuplicateMemoryDateError(memory.date)
      }
      await handle.run(
        `INSERT INTO memories
          (id, date, type, prompt_id, prompt_text_snapshot, photo_path, thumbnail_path, caption, created_at, updated_at, added_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        memoryToRowParams(memory),
      )
      return memory
    },

    async updateMemory(id, patch: UpdateMemoryPatch) {
      const handle = await getDb()
      const current = await this.getMemoryById(id)
      if (!current) throw new Error(`Memory not found: ${id}`)
      const updated: MemoryRecord = { ...current, ...patch }
      await handle.run(
        `UPDATE memories SET caption = ?, photo_path = ?, thumbnail_path = ?, updated_at = ? WHERE id = ?`,
        [updated.caption ?? null, updated.photoPath, updated.thumbnailPath, updated.updatedAt, id],
      )
      return updated
    },

    async deleteMemory(id) {
      const handle = await getDb()
      await handle.run('DELETE FROM memories WHERE id = ?', [id])
    },

    async getSettings() {
      const handle = await getDb()
      return readSettingsRow(handle)
    },

    async updateSettings(patch) {
      const handle = await getDb()
      const current = await readSettingsRow(handle)
      const next: AppSettingsRecord = { ...current, ...patch }
      await handle.run(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [SETTINGS_KEY, JSON.stringify(next)],
      )
      return next
    },

    async replaceMemories(memories) {
      const handle = await getDb()
      await handle.execute('BEGIN TRANSACTION')
      try {
        for (const memory of memories) {
          await handle.run(
            `INSERT OR REPLACE INTO memories
              (id, date, type, prompt_id, prompt_text_snapshot, photo_path, thumbnail_path, caption, created_at, updated_at, added_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            memoryToRowParams(memory),
          )
        }
        await handle.execute('COMMIT')
      } catch (err) {
        await handle.execute('ROLLBACK')
        throw err
      }
    },

    async deleteAllData() {
      const handle = await getDb()
      await handle.execute('DELETE FROM memories; DELETE FROM settings;')
    },
  }
}
