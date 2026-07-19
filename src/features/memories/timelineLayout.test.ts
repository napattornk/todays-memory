import { describe, expect, it } from 'vitest'
import { layoutMonthEntries } from './timelineLayout'
import type { MemoryRecord } from '@/db/schema'

function makeMemory(overrides: Partial<MemoryRecord>): MemoryRecord {
  const now = new Date().toISOString()
  return {
    id: overrides.id ?? 'mem',
    date: '2026-07-01',
    type: 'daily',
    photoPath: 'photos/a.jpg',
    thumbnailPath: 'thumbnails/a.jpg',
    createdAt: now,
    updatedAt: now,
    addedAt: now,
    ...overrides,
  }
}

describe('layoutMonthEntries', () => {
  it('pairs two adjacent caption-less daily entries', () => {
    const a = makeMemory({ id: 'a' })
    const b = makeMemory({ id: 'b' })
    expect(layoutMonthEntries([a, b])).toEqual([{ kind: 'pair', memories: [a, b] }])
  })

  it('keeps a captioned entry full width', () => {
    const a = makeMemory({ id: 'a', caption: 'A note.' })
    expect(layoutMonthEntries([a])).toEqual([{ kind: 'full', memory: a }])
  })

  it('keeps a retrospective entry full width even without a caption', () => {
    const a = makeMemory({ id: 'a', type: 'retrospective' })
    expect(layoutMonthEntries([a])).toEqual([{ kind: 'full', memory: a }])
  })

  it('flushes an odd pairable entry as full width when the next one is not pairable', () => {
    const a = makeMemory({ id: 'a' })
    const b = makeMemory({ id: 'b', caption: 'Has a caption.' })
    expect(layoutMonthEntries([a, b])).toEqual([
      { kind: 'full', memory: a },
      { kind: 'full', memory: b },
    ])
  })

  it('flushes a trailing odd pairable entry at the end of the list', () => {
    const a = makeMemory({ id: 'a' })
    const b = makeMemory({ id: 'b' })
    const c = makeMemory({ id: 'c' })
    expect(layoutMonthEntries([a, b, c])).toEqual([
      { kind: 'pair', memories: [a, b] },
      { kind: 'full', memory: c },
    ])
  })

  it('preserves overall order across a mix of pairs and full entries', () => {
    const a = makeMemory({ id: 'a', caption: 'x' })
    const b = makeMemory({ id: 'b' })
    const c = makeMemory({ id: 'c' })
    const d = makeMemory({ id: 'd', type: 'retrospective' })
    expect(layoutMonthEntries([a, b, c, d])).toEqual([
      { kind: 'full', memory: a },
      { kind: 'pair', memories: [b, c] },
      { kind: 'full', memory: d },
    ])
  })
})
