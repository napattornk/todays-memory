import { isFutureDate, isWithinGracePeriod } from '@/utils/date'
import type { LocalDate } from '@/types/memory'

export type CalendarTapAction =
  | { kind: 'open'; memoryId: string }
  | { kind: 'add-daily' }
  | { kind: 'add-retrospective' }
  | { kind: 'none' }

/**
 * Pure routing decision for tapping a calendar day cell:
 * - a date with a memory always opens it
 * - a future date never does anything
 * - an empty date within the grace period starts the daily flow
 * - an empty date older than the grace period starts the retrospective flow
 */
export function resolveCalendarTap(
  date: LocalDate,
  existingMemoryId: string | undefined,
  today: LocalDate,
): CalendarTapAction {
  if (existingMemoryId) return { kind: 'open', memoryId: existingMemoryId }
  if (isFutureDate(date, today)) return { kind: 'none' }
  if (isWithinGracePeriod(date, today)) return { kind: 'add-daily' }
  return { kind: 'add-retrospective' }
}
