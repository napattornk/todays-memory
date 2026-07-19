import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllMemories } from '@/hooks/useMemories'
import { usePhotoUrl } from '@/hooks/usePhotoUrl'
import { formatMonthLabel, formatShortDateLabel, monthKey } from '@/utils/date'
import type { MemoryRecord } from '@/db/schema'

function TimelineEntry({ memory }: { memory: MemoryRecord }) {
  const navigate = useNavigate()
  const thumbUrl = usePhotoUrl(memory.thumbnailPath)
  const isRetrospective = memory.type === 'retrospective'

  return (
    <button
      type="button"
      onClick={() => navigate(`/memory/${memory.id}`)}
      className="flex w-full gap-4 rounded-xl p-2 text-left hover:bg-black/5 dark:hover:bg-white/5"
    >
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-black/5">
        {thumbUrl && <img src={thumbUrl} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
            {formatShortDateLabel(memory.date)}
          </span>
          {isRetrospective && (
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--color-muted)] dark:bg-white/10">
              Added later
            </span>
          )}
        </div>
        <p className="truncate font-serif text-lg">
          {isRetrospective ? 'Looking back…' : memory.promptTextSnapshot}
        </p>
        {memory.caption && (
          <p className="truncate text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
            {memory.caption}
          </p>
        )}
      </div>
    </button>
  )
}

export default function MemoriesPage() {
  const { memories, loading } = useAllMemories()

  const groups = useMemo(() => {
    const map = new Map<string, MemoryRecord[]>()
    for (const memory of memories) {
      const key = monthKey(memory.date)
      const list = map.get(key) ?? []
      list.push(memory)
      map.set(key, list)
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))
  }, [memories])

  if (loading) return null

  if (memories.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
        <p>No memories yet.</p>
        <p className="text-sm">Some days are remembered later.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {groups.map(([key, group]) => (
        <section key={key}>
          <h2 className="mb-2 px-2 text-sm font-medium uppercase tracking-wide text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
            {formatMonthLabel(key)}
          </h2>
          <div className="flex flex-col gap-1">
            {group.map((memory) => (
              <TimelineEntry key={memory.id} memory={memory} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
