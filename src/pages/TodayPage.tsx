import { useNavigate } from 'react-router-dom'
import { useCurrentLocalDate } from '@/hooks/useCurrentLocalDate'
import { useMemoryByDate } from '@/hooks/useMemories'
import { usePhotoUrl } from '@/hooks/usePhotoUrl'
import { promptForDate } from '@/features/prompts/promptEngine'
import { formatDateLabel } from '@/utils/date'

export default function TodayPage() {
  const date = useCurrentLocalDate()
  const { memory, loading, refresh } = useMemoryByDate(date)
  const navigate = useNavigate()
  const photoUrl = usePhotoUrl(memory?.photoPath)
  const prompt = promptForDate(date)

  if (loading) return null

  if (!memory) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm uppercase tracking-wide text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
            {formatDateLabel(date)}
          </p>
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent)]">
            Today&rsquo;s prompt
          </p>
          <h1 className="font-serif text-3xl leading-snug text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">
            {prompt.text}
          </h1>
        </div>
        <p className="max-w-xs text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
          Carry this with you. Come back when you know what today meant.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/add?date=${date}&type=daily`)}
          className="min-h-11 rounded-full bg-[var(--color-accent)] px-8 py-3 font-medium text-white"
        >
          Add Today&rsquo;s Memory
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 py-4">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
          {formatDateLabel(memory.date)}
        </p>
        <span className="text-xs uppercase tracking-widest text-[var(--color-accent)]">
          Remembered
        </span>
      </div>
      {memory.promptTextSnapshot && (
        <h1 className="font-serif text-2xl leading-snug text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">
          {memory.promptTextSnapshot}
        </h1>
      )}
      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-black/5">
        {photoUrl && (
          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      {memory.caption && (
        <p className="text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">{memory.caption}</p>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate(`/memory/${memory.id}`)}
          className="min-h-11 flex-1 rounded-full border border-[var(--color-line)] px-4 py-2 dark:border-[var(--color-line-dark)]"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => navigate(`/story/${memory.id}`)}
          className="min-h-11 flex-1 rounded-full bg-[var(--color-accent)] px-4 py-2 text-white"
        >
          Share
        </button>
      </div>
      <button type="button" onClick={() => refresh()} className="sr-only">
        Refresh
      </button>
    </div>
  )
}
