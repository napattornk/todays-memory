import { describe, expect, it } from 'vitest'
import { resolveCalendarTap } from './calendarRules'

const today = '2026-07-19'

describe('resolveCalendarTap', () => {
  it('opens an existing memory regardless of date', () => {
    expect(resolveCalendarTap('2020-01-01', 'mem-1', today)).toEqual({
      kind: 'open',
      memoryId: 'mem-1',
    })
  })

  it('does nothing for a future empty date', () => {
    expect(resolveCalendarTap('2026-08-01', undefined, today)).toEqual({ kind: 'none' })
  })

  it('starts the daily flow for an empty date within the grace period', () => {
    expect(resolveCalendarTap('2026-07-15', undefined, today)).toEqual({ kind: 'add-daily' })
  })

  it('starts the retrospective flow for an empty date older than the grace period', () => {
    expect(resolveCalendarTap('2026-01-01', undefined, today)).toEqual({
      kind: 'add-retrospective',
    })
  })
})
