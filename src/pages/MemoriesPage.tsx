import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllMemories } from '@/hooks/useMemories'
import { usePhotoUrl } from '@/hooks/usePhotoUrl'
import { formatMonthLabel, formatShortDateLabel, monthKey } from '@/utils/date'
import { layoutMonthEntries } from '@/features/memories/timelineLayout'
import type { MemoryRecord } from '@/db/schema'

function EntryMeta({ memory, size }: { memory: MemoryRecord; size: 'full' | 'pair' }) {
  const isRetrospective = memory.type === 'retrospective'
  return (
    <>
      <div className="mb-2 flex items-center gap-2">
        <p className={size === 'full' ? 'text-xs text-[var(--color-muted)]' : 'text-[11px] text-[var(--color-muted)]'}>
          {formatShortDateLabel(memory.date)}
        </p>
        {isRetrospective && (
          <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
            Added later
          </span>
        )}
      </div>
      <p
        className={`font-serif italic leading-snug text-[var(--color-ink)] ${size === 'full' ? 'text-lg' : 'text-sm'}`}
      >
        {isRetrospective ? 'Looking back…' : memory.promptTextSnapshot}
      </p>
      {memory.caption && size === 'full' && (
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">{memory.caption}</p>
      )}
    </>
  )
}

function FullEntry({ memory }: { memory: MemoryRecord }) {
  const navigate = useNavigate()
  const photoUrl = usePhotoUrl(memory.photoPath)

  return (
    <button
      type="button"
      onClick={() => navigate(`/memory/${memory.id}`)}
      className="mb-10 block w-full text-left"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-black/5">
        {photoUrl && <img src={photoUrl} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="mt-3 px-0.5">
        <EntryMeta memory={memory} size="full" />
      </div>
    </button>
  )
}

function PairEntry({ memory }: { memory: MemoryRecord }) {
  const navigate = useNavigate()
  const photoUrl = usePhotoUrl(memory.photoPath)

  return (
    <button type="button" onClick={() => navigate(`/memory/${memory.id}`)} className="block text-left">
      <div className="aspect-[3/4] w-full overflow-hidden bg-black/5">
        {photoUrl && <img src={photoUrl} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="mt-2.5">
        <EntryMeta memory={memory} size="pair" />
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
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-[var(--color-muted)]">
        <p>No memories yet.</p>
        <p className="text-sm">Some days are remembered later.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col py-4">
      {groups.map(([key, group]) => {
        const items = layoutMonthEntries(group)
        return (
          <section key={key} className="mb-4">
            <h2 className="mb-6 px-0.5 font-serif text-xl italic text-[var(--color-ink)]">
              {formatMonthLabel(key)}
            </h2>
            {items.map((item, i) =>
              item.kind === 'full' ? (
                <FullEntry key={item.memory.id} memory={item.memory} />
              ) : (
                <div key={`pair-${i}`} className="mb-10 grid grid-cols-2 gap-3.5">
                  <PairEntry memory={item.memories[0]} />
                  <PairEntry memory={item.memories[1]} />
                </div>
              ),
            )}
          </section>
        )
      })}
    </div>
  )
}
