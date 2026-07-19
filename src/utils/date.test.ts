import { describe, expect, it } from 'vitest'
import {
  addDays,
  addMonths,
  daysInMonth,
  diffInCalendarDays,
  earliestGraceDate,
  formatLocalDate,
  isFutureDate,
  isWithinGracePeriod,
  monthKey,
} from './date'

describe('formatLocalDate', () => {
  it('formats using local calendar fields, not UTC', () => {
    const d = new Date(2026, 0, 5) // Jan 5, 2026 local
    expect(formatLocalDate(d)).toBe('2026-01-05')
  })
})

describe('diffInCalendarDays', () => {
  it('computes calendar-day differences across a month boundary', () => {
    expect(diffInCalendarDays('2026-01-31', '2026-02-01')).toBe(1)
  })

  it('computes calendar-day differences across a year boundary', () => {
    expect(diffInCalendarDays('2025-12-31', '2026-01-01')).toBe(1)
  })

  it('handles leap-year February correctly', () => {
    // 2028 is a leap year
    expect(diffInCalendarDays('2028-02-28', '2028-03-01')).toBe(2)
    expect(diffInCalendarDays('2027-02-28', '2027-03-01')).toBe(1)
  })
})

describe('isWithinGracePeriod', () => {
  const today = '2026-07-19'

  it('includes today', () => {
    expect(isWithinGracePeriod(today, today)).toBe(true)
  })

  it('includes exactly 7 calendar days back', () => {
    expect(isWithinGracePeriod('2026-07-12', today)).toBe(true)
  })

  it('excludes 8 calendar days back', () => {
    expect(isWithinGracePeriod('2026-07-11', today)).toBe(false)
  })

  it('excludes future dates', () => {
    expect(isWithinGracePeriod('2026-07-20', today)).toBe(false)
  })

  it('uses calendar days, not a rolling 168-hour window, across a month boundary', () => {
    // If "today" is Aug 3, the grace period should reach back to July 27,
    // not be thrown off by July having 31 days.
    expect(isWithinGracePeriod('2026-07-27', '2026-08-03')).toBe(true)
    expect(isWithinGracePeriod('2026-07-26', '2026-08-03')).toBe(false)
  })
})

describe('earliestGraceDate', () => {
  it('is exactly 7 days before today', () => {
    expect(earliestGraceDate('2026-07-19')).toBe('2026-07-12')
  })
})

describe('isFutureDate', () => {
  it('flags tomorrow as future', () => {
    expect(isFutureDate('2026-07-20', '2026-07-19')).toBe(true)
  })
  it('does not flag today as future', () => {
    expect(isFutureDate('2026-07-19', '2026-07-19')).toBe(false)
  })
})

describe('addDays', () => {
  it('rolls over month and year boundaries', () => {
    expect(addDays('2025-12-30', 3)).toBe('2026-01-02')
  })
})

describe('daysInMonth', () => {
  it('knows February has 29 days in a leap year', () => {
    expect(daysInMonth(2028, 2)).toBe(29)
    expect(daysInMonth(2027, 2)).toBe(28)
  })
})

describe('addMonths', () => {
  it('wraps across a year boundary', () => {
    expect(addMonths(2026, 12, 1)).toEqual({ year: 2027, month: 1 })
    expect(addMonths(2026, 1, -1)).toEqual({ year: 2025, month: 12 })
  })
})

describe('monthKey', () => {
  it('extracts YYYY-MM', () => {
    expect(monthKey('2026-07-19')).toBe('2026-07')
  })
})
