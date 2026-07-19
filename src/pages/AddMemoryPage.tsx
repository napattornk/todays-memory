import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { photoService } from '@/services'
import { saveNewMemory } from '@/features/memories/saveMemory'
import { useMemoryDraft, startDraft, updateDraft, clearDraft } from '@/features/memories/draftStore'
import { promptForDate } from '@/features/prompts/promptEngine'
import { formatDateLabel } from '@/utils/date'
import type { MemoryType } from '@/types/memory'

const CAPTION_MAX = 160

export default function AddMemoryPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const date = params.get('date') ?? ''
  const type: MemoryType = params.get('type') === 'retrospective' ? 'retrospective' : 'daily'

  const draft = useMemoryDraft()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!draft || draft.date !== date) {
      startDraft(date, type)
    }
    // Intentionally only re-run when navigating to a different date/type —
    // an existing in-progress draft for the same date must survive remounts
    // caused by the app being backgrounded and resumed mid-flow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, type])

  const isRetrospective = type === 'retrospective'
  const prompt = !isRetrospective ? promptForDate(date) : undefined

  async function capture(source: 'camera' | 'library') {
    setError(null)
    try {
      const photo = source === 'camera' ? await photoService.takePhoto() : await photoService.choosePhoto()
      updateDraft({ photoWebPath: photo.webPath })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not access the photo.')
    }
  }

  async function handleSave() {
    if (!draft?.photoWebPath) return
    setSaving(true)
    setError(null)
    try {
      const memory = await saveNewMemory({
        date,
        type,
        sourceWebPath: draft.photoWebPath,
        caption: draft.caption,
      })
      clearDraft()
      navigate(`/memory/${memory.id}`, { replace: true })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong saving this memory. Nothing was lost — try again.',
      )
      setSaving(false)
    }
  }

  function handleCancel() {
    clearDraft()
    navigate(-1)
  }

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto py-6" style={{ paddingTop: 'var(--safe-top)' }}>
      <div className="px-1">
        <p className="text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
          {formatDateLabel(date)}
        </p>
        {isRetrospective ? (
          <>
            <h1 className="mt-1 font-serif text-2xl">Retrospective Memory</h1>
            <p className="mt-2 text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
              Some memories become meaningful only with time. Looking back, what do you
              remember most about this day?
            </p>
          </>
        ) : (
          <h1 className="mt-1 font-serif text-2xl leading-snug">{prompt?.text}</h1>
        )}
      </div>

      <div className="min-h-[40vh] flex-1 overflow-hidden rounded-2xl bg-black/5">
        {draft?.photoWebPath ? (
          <img src={draft.photoWebPath} alt="Selected preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full min-h-[40vh] flex-col items-center justify-center gap-3 p-6 text-center text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
            <p>The photo does not need to capture the exact moment. It can simply represent it.</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 px-1">
        <button
          type="button"
          onClick={() => capture('camera')}
          className="min-h-11 flex-1 rounded-full border border-[var(--color-line)] px-4 py-2 dark:border-[var(--color-line-dark)]"
        >
          Take photo
        </button>
        <button
          type="button"
          onClick={() => capture('library')}
          className="min-h-11 flex-1 rounded-full border border-[var(--color-line)] px-4 py-2 dark:border-[var(--color-line-dark)]"
        >
          Choose photo
        </button>
      </div>

      <div className="px-1">
        <label htmlFor="caption" className="mb-1 block text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
          How did this moment matter?
        </label>
        <textarea
          id="caption"
          value={draft?.caption ?? ''}
          maxLength={CAPTION_MAX}
          onChange={(e) => updateDraft({ caption: e.target.value })}
          rows={3}
          className="w-full rounded-xl border border-[var(--color-line)] bg-transparent p-3 dark:border-[var(--color-line-dark)]"
          placeholder="Optional"
        />
        <p className="mt-1 text-right text-xs text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
          {(draft?.caption ?? '').length}/{CAPTION_MAX}
        </p>
      </div>

      {error && <p className="px-1 text-sm text-red-600" role="alert">{error}</p>}

      <div className="flex gap-3 px-1">
        <button
          type="button"
          onClick={handleCancel}
          className="min-h-11 flex-1 rounded-full px-4 py-2 text-[var(--color-muted)]"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!draft?.photoWebPath || saving}
          onClick={handleSave}
          className="min-h-11 flex-1 rounded-full bg-[var(--color-accent)] px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}
