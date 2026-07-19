import { photoService, memoryStorageService } from '@/services'
import type { MemoryRecord } from '@/db/schema'
import type { LocalDate, MemoryType } from '@/types/memory'
import { promptForDate } from '@/features/prompts/promptEngine'

export interface SaveNewMemoryInput {
  date: LocalDate
  type: MemoryType
  sourceWebPath: string
  caption?: string
}

/**
 * Full "add memory" transaction: process + persist the photo, then write
 * metadata. If the metadata write fails, the just-written photo/thumbnail
 * files are deleted so no orphaned files are left behind. Callers must not
 * report success until this resolves.
 */
export async function saveNewMemory(input: SaveNewMemoryInput): Promise<MemoryRecord> {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const { photoPath, thumbnailPath } = await photoService.processAndSave(
    input.sourceWebPath,
    id,
  )

  const prompt = input.type === 'daily' ? promptForDate(input.date) : undefined

  const record: MemoryRecord = {
    id,
    date: input.date,
    type: input.type,
    promptId: prompt?.id,
    promptTextSnapshot: prompt?.text,
    photoPath,
    thumbnailPath,
    caption: input.caption?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    addedAt: now,
  }

  try {
    return await memoryStorageService.createMemory(record)
  } catch (err) {
    await photoService.deleteFiles([photoPath, thumbnailPath])
    throw err
  }
}

export interface ReplaceMemoryPhotoInput {
  memoryId: string
  sourceWebPath: string
}

/** Replaces a memory's photo (only valid while the photo is still unlocked). */
export async function replaceMemoryPhoto(
  input: ReplaceMemoryPhotoInput,
): Promise<MemoryRecord> {
  const current = await memoryStorageService.getMemoryById(input.memoryId)
  if (!current) throw new Error(`Memory not found: ${input.memoryId}`)

  const { photoPath, thumbnailPath } = await photoService.processAndSave(
    input.sourceWebPath,
    input.memoryId,
  )

  try {
    return await memoryStorageService.updateMemory(input.memoryId, {
      photoPath,
      thumbnailPath,
      updatedAt: new Date().toISOString(),
    })
  } catch (err) {
    await photoService.deleteFiles([photoPath, thumbnailPath])
    throw err
  }
}

export async function updateMemoryCaption(
  memoryId: string,
  caption: string,
): Promise<MemoryRecord> {
  return memoryStorageService.updateMemory(memoryId, {
    caption: caption.trim() || undefined,
    updatedAt: new Date().toISOString(),
  })
}

export async function deleteMemoryWithFiles(memoryId: string): Promise<void> {
  const memory = await memoryStorageService.getMemoryById(memoryId)
  if (!memory) return
  await memoryStorageService.deleteMemory(memoryId)
  await photoService.deleteFiles([memory.photoPath, memory.thumbnailPath])
}
