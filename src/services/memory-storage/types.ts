import type { MemoryRecord, AppSettingsRecord } from '@/db/schema'
import type { LocalDate } from '@/types/memory'

export type CreateMemoryInput = MemoryRecord

export type UpdateMemoryPatch = Partial<
  Pick<MemoryRecord, 'caption' | 'photoPath' | 'thumbnailPath' | 'updatedAt'>
>

export class DuplicateMemoryDateError extends Error {
  constructor(date: LocalDate) {
    super(`A memory already exists for ${date}.`)
    this.name = 'DuplicateMemoryDateError'
  }
}

export interface MemoryStorageService {
  init(): Promise<void>
  getMemoryByDate(date: LocalDate): Promise<MemoryRecord | null>
  getMemoryById(id: string): Promise<MemoryRecord | null>
  listMemories(): Promise<MemoryRecord[]>
  /** Throws DuplicateMemoryDateError if a memory already exists for the date. */
  createMemory(memory: CreateMemoryInput): Promise<MemoryRecord>
  updateMemory(id: string, patch: UpdateMemoryPatch): Promise<MemoryRecord>
  deleteMemory(id: string): Promise<void>

  getSettings(): Promise<AppSettingsRecord>
  updateSettings(patch: Partial<AppSettingsRecord>): Promise<AppSettingsRecord>

  /** Replaces the entire memory set (used by transactional backup import). */
  replaceMemories(memories: MemoryRecord[]): Promise<void>
  deleteAllData(): Promise<void>
}
