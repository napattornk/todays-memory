import { useSyncExternalStore } from 'react'
import type { LocalDate, MemoryType } from '@/types/memory'

export interface MemoryDraft {
  date: LocalDate
  type: MemoryType
  photoWebPath?: string
  caption: string
}

/**
 * Module-level (outside React) store for the in-progress add/edit-memory
 * draft. Kept in JS memory rather than Preferences (which is reserved for
 * app settings) so it survives the component unmounting when the app is
 * backgrounded mid-flow and the user returns to resume the same draft,
 * without creating a duplicate memory. Cleared explicitly on save/cancel.
 */
let draft: MemoryDraft | null = null
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

export function startDraft(date: LocalDate, type: MemoryType) {
  draft = { date, type, caption: '' }
  notify()
}

export function updateDraft(patch: Partial<MemoryDraft>) {
  if (!draft) return
  draft = { ...draft, ...patch }
  notify()
}

export function clearDraft() {
  draft = null
  notify()
}

export function getDraft(): MemoryDraft | null {
  return draft
}

export function useMemoryDraft(): MemoryDraft | null {
  return useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange)
      return () => listeners.delete(onChange)
    },
    () => draft,
  )
}
