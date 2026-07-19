import { describe, expect, it } from 'vitest'
import { buildStoryViewModel } from './buildStoryViewModel'

describe('buildStoryViewModel', () => {
  it('shows the prompt snapshot for a daily memory', () => {
    const model = buildStoryViewModel(
      { date: '2026-07-19', type: 'daily', promptTextSnapshot: 'What made today feel different?' },
      'blob:photo',
      'cream',
    )
    expect(model.promptOrReflectionLabel).toBe('What made today feel different?')
  })

  it('shows "Looking back…" instead of a prompt for a retrospective memory', () => {
    const model = buildStoryViewModel(
      { date: '2020-01-01', type: 'retrospective', promptTextSnapshot: undefined },
      'blob:photo',
      'white',
    )
    expect(model.promptOrReflectionLabel).toBe('Looking back…')
  })

  it('handles a memory with no caption', () => {
    const model = buildStoryViewModel(
      { date: '2026-07-19', type: 'daily', promptTextSnapshot: 'x', caption: undefined },
      'blob:photo',
      'white',
    )
    expect(model.caption).toBeUndefined()
  })

  it('passes through a long caption unchanged', () => {
    const long = 'x'.repeat(160)
    const model = buildStoryViewModel(
      { date: '2026-07-19', type: 'daily', promptTextSnapshot: 'x', caption: long },
      'blob:photo',
      'white',
    )
    expect(model.caption).toBe(long)
  })

  it('carries the requested background through unchanged', () => {
    const model = buildStoryViewModel(
      { date: '2026-07-19', type: 'daily', promptTextSnapshot: 'x' },
      'blob:photo',
      'warm-beige',
    )
    expect(model.background).toBe('warm-beige')
  })
})
