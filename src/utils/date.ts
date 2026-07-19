import type { LocalDate } from '@/types/memory'

/** Number of calendar days, including today, that remain fully editable. */
export const GRACE_PERIOD_DAYS = 8

/** Formats a Date as a local-calendar `YYYY-MM-DD` string (no UTC conversion). */
export function formatLocalDate(d: Date): LocalDate {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Returns today's local-calendar date. Call fresh on every use — never cache. */
export function todayLocalDate(): LocalDate {
  return formatLocalDate(new Date())
}

/** Parses a `YYYY-MM-DD` string into a local Date at midnight (no timezone shift). */
export function parseLocalDate(date: LocalDate): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(date: LocalDate, delta: number): LocalDate {
  const d = parseLocalDate(date)
  d.setDate(d.getDate() + delta)
  return formatLocalDate(d)
}

/** Calendar-day difference (b - a), safe across month/year/DST boundaries. */
export function diffInCalendarDays(a: LocalDate, b: LocalDate): number {
  const da = parseLocalDate(a)
  const db = parseLocalDate(b)
  // Normalize both to noon to sidestep DST-induced +/-1hr drift before dividing.
  da.setHours(12, 0, 0, 0)
  db.setHours(12, 0, 0, 0)
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((db.getTime() - da.getTime()) / msPerDay)
}

export function isFutureDate(date: LocalDate, today: LocalDate = todayLocalDate()): boolean {
  return diffInCalendarDays(today, date) > 0
}

export function isToday(date: LocalDate, today: LocalDate = todayLocalDate()): boolean {
  return date === today
}

/**
 * True when `date` falls within the editable grace period: today and the
 * previous GRACE_PERIOD_DAYS - 1 calendar days, using calendar-day
 * subtraction rather than a rolling 168-hour window.
 */
export function isWithinGracePeriod(
  date: LocalDate,
  today: LocalDate = todayLocalDate(),
): boolean {
  const diff = diffInCalendarDays(date, today)
  return diff >= 0 && diff < GRACE_PERIOD_DAYS
}

export function earliestGraceDate(today: LocalDate = todayLocalDate()): LocalDate {
  return addDays(today, -(GRACE_PERIOD_DAYS - 1))
}

export function formatDateLabel(date: LocalDate): string {
  return parseLocalDate(date).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatShortDateLabel(date: LocalDate): string {
  return parseLocalDate(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function monthKey(date: LocalDate): string {
  return date.slice(0, 7) // YYYY-MM
}

export function formatMonthLabel(monthKeyValue: string): string {
  const [year, month] = monthKeyValue.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

/** Days in a given month (1-indexed month), leap-year aware. */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/** 0 (Sun) - 6 (Sat) weekday of the 1st of the given month. */
export function firstWeekdayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay()
}

export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const total = year * 12 + (month - 1) + delta
  const y = Math.floor(total / 12)
  const m = (total % 12) + 1
  return { year: y, month: m }
}
