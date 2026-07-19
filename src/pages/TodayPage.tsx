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
          <p className="text-sm uppercase tracking-wide text-[var(--color-muted)]">
            {formatDateLabel(date)}
          </p>
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent)]">
            Today&rsquo;s prompt
          </p>
          <h1 className="font-serif text-3xl leading-snug text-[var(--color-ink)]">
            {prompt.text}
          </h1>
        </div>
        <p className="max-w-xs text-[var(--color-muted)]">
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
    <div className="flex h-full flex-col gap-3 py-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-[var(--color-muted)]">{formatDateLabel(memory.date)}</p>
        <span className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
          <CheckIcon />
          Remembered
        </span>
      </div>

      {memory.promptTextSnapshot && (
        <h1 className="px-1 font-serif text-2xl leading-snug text-[var(--color-ink)]">
          {memory.promptTextSnapshot}
        </h1>
      )}

      {/* Full-bleed hero photo, breaking out of the page's side padding so
          it reaches the screen edges — the photo is the emotional center of
          the screen, not one block among several. */}
      <div className="relative -mx-4 min-h-0 flex-1 overflow-hidden bg-black/5">
        {photoUrl && <img src={photoUrl} alt="" className="h-full w-full object-cover" />}

        {memory.caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-5 pb-20 pt-16">
            <p className="pr-2 text-white drop-shadow">{memory.caption}</p>
          </div>
        )}

        <div
          className="absolute bottom-4 flex gap-2"
          style={{ right: 'calc(var(--safe-right) + 1rem)' }}
        >
          <button
            type="button"
            aria-label="Edit this memory"
            onClick={() => navigate(`/memory/${memory.id}`)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            aria-label="Share this memory"
            onClick={() => navigate(`/story/${memory.id}`)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-lg"
          >
            <ShareIcon />
          </button>
        </div>
      </div>

      <button type="button" onClick={() => refresh()} className="sr-only">
        Refresh
      </button>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 13 4 4L19 7"
      />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"
      />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15V4m0 0 4 4m-4-4L8 8M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"
      />
    </svg>
  )
}
