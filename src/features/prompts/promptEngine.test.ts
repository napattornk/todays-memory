import { describe, expect, it } from 'vitest'
import { promptForDate } from './promptEngine'
import { PROMPTS } from '@/data/prompts/prompts'

describe('promptForDate', () => {
  it('has at least 60 prompts available', () => {
    expect(PROMPTS.length).toBeGreaterThanOrEqual(60)
  })

  it('is deterministic for the same date', () => {
    const a = promptForDate('2026-07-19')
    const b = promptForDate('2026-07-19')
    expect(a.id).toBe(b.id)
  })

  it('does not change on repeated calls (refresh-stable)', () => {
    const results = Array.from({ length: 5 }, () => promptForDate('2026-03-01').id)
    expect(new Set(results).size).toBe(1)
  })

  it('generally assigns different prompts to different dates', () => {
    const ids = new Set(
      Array.from({ length: 30 }, (_, i) =>
        promptForDate(`2026-01-${String(i + 1).padStart(2, '0')}`).id,
      ),
    )
    expect(ids.size).toBeGreaterThan(1)
  })

  it('is pre-sorted by stable id (not source-file declaration order), so reordering the seed list cannot change assignment', () => {
    const ids = PROMPTS.map((p) => p.id)
    const sortedIds = [...ids].sort((a, b) => a.localeCompare(b))
    expect(ids).toEqual(sortedIds)
  })

  it('rotationIndex matches each prompt position in the stable id-sorted list', () => {
    PROMPTS.forEach((p, index) => expect(p.rotationIndex).toBe(index))
  })
})
