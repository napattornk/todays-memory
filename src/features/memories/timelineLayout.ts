import type { MemoryRecord } from '@/db/schema'

export type TimelineLayoutItem =
  | { kind: 'full'; memory: MemoryRecord }
  | { kind: 'pair'; memories: [MemoryRecord, MemoryRecord] }

/**
 * Paces a month's memories like a photo book rather than a uniform feed:
 * substantial entries (retrospective, or anything with a caption) stay
 * full width; short, caption-less daily entries pair up into a two-column
 * spread with their nearest such neighbor. Order is preserved — pairing
 * only ever groups adjacent eligible entries, never reorders the list.
 */
export function layoutMonthEntries(memories: MemoryRecord[]): TimelineLayoutItem[] {
  const isPairable = (m: MemoryRecord) => m.type === 'daily' && !m.caption

  const items: TimelineLayoutItem[] = []
  let pending: MemoryRecord | null = null

  for (const memory of memories) {
    if (isPairable(memory)) {
      if (pending) {
        items.push({ kind: 'pair', memories: [pending, memory] })
        pending = null
      } else {
        pending = memory
      }
    } else {
      if (pending) {
        items.push({ kind: 'full', memory: pending })
        pending = null
      }
      items.push({ kind: 'full', memory })
    }
  }
  if (pending) items.push({ kind: 'full', memory: pending })

  return items
}
