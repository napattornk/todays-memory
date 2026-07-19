import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllMemories } from '@/hooks/useMemories'
import { usePhotoUrl } from '@/hooks/usePhotoUrl'
import {
  addMonths,
  daysInMonth,
  firstWeekdayOfMonth,
  formatLocalDate,
  formatMonthLabel,
  isFutureDate,
  todayLocalDate,
} from '@/utils/date'
import { resolveCalendarTap } from '@/features/calendar/calendarRules'
import type { MemoryRecord } from '@/db/schema'

interface DayCellProps {
  date: string
  day: number
  memory: MemoryRecord | undefined
  isToday: boolean
  future: boolean
  onTap: (date: string) => void
}

function DayCell({ date, day, memory, isToday, future, onTap }: DayCellProps) {
  const thumbUrl = usePhotoUrl(memory?.thumbnailPath)

  return (
    <button
      type="button"
      disabled={future}
      onClick={() => onTap(date)}
      aria-label={date}
      className={`relative flex aspect-square min-h-11 flex-col items-center justify-center overflow-hidden rounded-lg border text-sm font-medium transition-colors ${
        isToday
          ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]'
          : 'border-[var(--color-line)]'
      } ${future ? 'opacity-35' : ''} ${
        memory
          ? 'text-white'
          : 'bg-[var(--color-cream)] text-[var(--color-ink)] hover:bg-[var(--color-line)]'
      }`}
    >
      {memory && thumbUrl && (
        <img
          src={thumbUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {memory && (
        <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
      )}
      <span className={`relative ${memory ? 'drop-shadow-sm' : ''}`}>{day}</span>
      {memory?.type === 'retrospective' && (
        <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-[var(--color-accent)] ring-1 ring-white/70" />
      )}
    </button>
  )
}

export default function CalendarPage() {
  const today = todayLocalDate()
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 })
  const { memories } = useAllMemories()
  const navigate = useNavigate()

  const byDate = useMemo(() => new Map(memories.map((m) => [m.date, m])), [memories])
  const monthKeyValue = `${cursor.year}-${String(cursor.month).padStart(2, '0')}`
  const total = daysInMonth(cursor.year, cursor.month)
  const leadingBlanks = firstWeekdayOfMonth(cursor.year, cursor.month)

  const cells = useMemo(() => {
    const result: { date: string | null }[] = []
    for (let i = 0; i < leadingBlanks; i++) result.push({ date: null })
    for (let day = 1; day <= total; day++) {
      result.push({ date: formatLocalDate(new Date(cursor.year, cursor.month - 1, day)) })
    }
    return result
  }, [cursor, leadingBlanks, total])

  function handleTap(date: string) {
    const action = resolveCalendarTap(date, byDate.get(date)?.id, today)
    switch (action.kind) {
      case 'open':
        navigate(`/memory/${action.memoryId}`)
        break
      case 'add-daily':
        navigate(`/add?date=${date}&type=daily`)
        break
      case 'add-retrospective':
        navigate(`/add?date=${date}&type=retrospective`)
        break
      case 'none':
        break
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 py-4">
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setCursor((c) => addMonths(c.year, c.month, -1))}
          className="min-h-11 min-w-11 rounded-full text-lg text-[var(--color-muted)] hover:bg-[var(--color-line)]"
        >
          ‹
        </button>
        <h1 className="font-serif text-xl text-[var(--color-ink)]">
          {formatMonthLabel(monthKeyValue)}
        </h1>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setCursor((c) => addMonths(c.year, c.month, 1))}
          className="min-h-11 min-w-11 rounded-full text-lg text-[var(--color-muted)] hover:bg-[var(--color-line)]"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 px-1 text-center text-xs font-medium text-[var(--color-muted)]">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 px-1">
        {cells.map((cell, i) => {
          if (!cell.date) return <div key={`blank-${i}`} />
          const memory = byDate.get(cell.date)
          const future = isFutureDate(cell.date, today)
          const isToday = cell.date === today
          const day = Number(cell.date.slice(-2))

          return (
            <DayCell
              key={cell.date}
              date={cell.date}
              day={day}
              memory={memory}
              isToday={isToday}
              future={future}
              onTap={handleTap}
            />
          )
        })}
      </div>

      <div className="mt-2 flex items-center justify-center gap-4 px-1 text-xs text-[var(--color-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]" />
          Today
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-[var(--color-ink)]" />
          Remembered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
          Added later
        </span>
      </div>
    </div>
  )
}
