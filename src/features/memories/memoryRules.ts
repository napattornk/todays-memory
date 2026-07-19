import type { MemoryRecord } from '@/db/schema'
import { isWithinGracePeriod, todayLocalDate } from '@/utils/date'

/**
 * Photo-lock status is derived from date + type rather than stored
 * redundantly: only "daily" memories lock, and only once they fall outside
 * the editable grace period. Retrospective memories never lock.
 */
export function isPhotoLocked(memory: Pick<MemoryRecord, 'date' | 'type'>, today = todayLocalDate()): boolean {
  if (memory.type === 'retrospective') return false
  return !isWithinGracePeriod(memory.date, today)
}

export function isCaptionEditable(_memory: Pick<MemoryRecord, 'date' | 'type'>): boolean {
  // Captions remain editable regardless of photo-lock or memory type.
  return true
}

/**
 * Locked daily memories are not normally deletable — only retrospective
 * memories, or daily memories still inside the grace period, support delete.
 */
export function isDeletable(memory: Pick<MemoryRecord, 'date' | 'type'>, today = todayLocalDate()): boolean {
  if (memory.type === 'retrospective') return true
  return isWithinGracePeriod(memory.date, today)
}

export function lockedPhotoCopy(): string {
  return 'The photo for this day is now part of your timeline. You can still add or update your reflection.'
}
