/**
 * Versioned SQLite migrations. Each entry runs once, in order, against a
 * fresh or upgrading database. Add new entries (never edit past ones) when
 * the schema changes, and bump CURRENT_SCHEMA_VERSION in schema.ts.
 */
export interface Migration {
  version: number
  statements: string[]
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK (type IN ('daily', 'retrospective')),
        prompt_id TEXT,
        prompt_text_snapshot TEXT,
        photo_path TEXT NOT NULL,
        thumbnail_path TEXT NOT NULL,
        caption TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        added_at TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_memories_date ON memories(date)`,
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS schema_meta (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        version INTEGER NOT NULL
      )`,
      `INSERT OR IGNORE INTO schema_meta (id, version) VALUES (1, 1)`,
    ],
  },
]

export function migrationsAfter(currentVersion: number): Migration[] {
  return MIGRATIONS.filter((m) => m.version > currentVersion).sort(
    (a, b) => a.version - b.version,
  )
}

export const LATEST_SCHEMA_VERSION = Math.max(...MIGRATIONS.map((m) => m.version))
