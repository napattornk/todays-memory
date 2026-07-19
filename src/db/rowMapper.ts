import type { MemoryRecord } from '@/db/schema'

export interface MemoryRow {
  id: string
  date: string
  type: string
  prompt_id: string | null
  prompt_text_snapshot: string | null
  photo_path: string
  thumbnail_path: string
  caption: string | null
  created_at: string
  updated_at: string
  added_at: string
}

export function rowToMemory(row: MemoryRow): MemoryRecord {
  return {
    id: row.id,
    date: row.date,
    type: row.type as MemoryRecord['type'],
    promptId: row.prompt_id ?? undefined,
    promptTextSnapshot: row.prompt_text_snapshot ?? undefined,
    photoPath: row.photo_path,
    thumbnailPath: row.thumbnail_path,
    caption: row.caption ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    addedAt: row.added_at,
  }
}

export function memoryToRowParams(memory: MemoryRecord): unknown[] {
  return [
    memory.id,
    memory.date,
    memory.type,
    memory.promptId ?? null,
    memory.promptTextSnapshot ?? null,
    memory.photoPath,
    memory.thumbnailPath,
    memory.caption ?? null,
    memory.createdAt,
    memory.updatedAt,
    memory.addedAt,
  ]
}
