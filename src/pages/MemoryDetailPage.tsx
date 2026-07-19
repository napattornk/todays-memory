import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMemoryById } from '@/hooks/useMemories'
import { usePhotoUrl } from '@/hooks/usePhotoUrl'
import { photoService } from '@/services'
import {
  replaceMemoryPhoto,
  updateMemoryCaption,
  deleteMemoryWithFiles,
} from '@/features/memories/saveMemory'
import { isPhotoLocked, isDeletable, lockedPhotoCopy } from '@/features/memories/memoryRules'
import { formatDateLabel } from '@/utils/date'

const CAPTION_MAX = 160

export default function MemoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { memory, loading, refresh } = useMemoryById(id)
  const photoUrl = usePhotoUrl(memory?.photoPath)
  const [caption, setCaption] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading || !memory) return null

  const locked = isPhotoLocked(memory)
  const deletable = isDeletable(memory)
  const isRetrospective = memory.type === 'retrospective'
  const captionValue = caption ?? memory.caption ?? ''

  async function saveCaption() {
    if (caption === null || !memory) return
    setBusy(true)
    try {
      await updateMemoryCaption(memory.id, caption)
      await refresh()
      setCaption(null)
    } finally {
      setBusy(false)
    }
  }

  async function replacePhoto(source: 'camera' | 'library') {
    if (!memory) return
    setError(null)
    try {
      const photo = source === 'camera' ? await photoService.takePhoto() : await photoService.choosePhoto()
      setBusy(true)
      await replaceMemoryPhoto({ memoryId: memory.id, sourceWebPath: photo.webPath })
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not replace the photo.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!memory) return
    setBusy(true)
    await deleteMemoryWithFiles(memory.id)
    navigate(-1)
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto py-6" style={{ paddingTop: 'var(--safe-top)' }}>
      <div className="flex items-center justify-between px-1">
        <button type="button" onClick={() => navigate(-1)} className="min-h-11 min-w-11 text-[var(--color-muted)]">
          ← Back
        </button>
        {isRetrospective && (
          <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-[var(--color-muted)] dark:bg-white/10 dark:text-[var(--color-muted-dark)]">
            Retrospective
          </span>
        )}
      </div>

      <div className="px-1">
        <p className="text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
          {formatDateLabel(memory.date)}
        </p>
        {isRetrospective ? (
          <h1 className="mt-1 font-serif text-2xl">Looking back…</h1>
        ) : (
          memory.promptTextSnapshot && (
            <h1 className="mt-1 font-serif text-2xl leading-snug">{memory.promptTextSnapshot}</h1>
          )
        )}
      </div>

      <div className="min-h-[40vh] flex-1 overflow-hidden rounded-2xl bg-black/5">
        {photoUrl && <img src={photoUrl} alt="" className="h-full w-full object-cover" />}
      </div>

      {!locked && (
        <div className="flex gap-3 px-1">
          <button
            type="button"
            disabled={busy}
            onClick={() => replacePhoto('camera')}
            className="min-h-11 flex-1 rounded-full border border-[var(--color-line)] px-4 py-2 text-sm dark:border-[var(--color-line-dark)]"
          >
            Retake photo
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => replacePhoto('library')}
            className="min-h-11 flex-1 rounded-full border border-[var(--color-line)] px-4 py-2 text-sm dark:border-[var(--color-line-dark)]"
          >
            Replace photo
          </button>
        </div>
      )}
      {locked && !isRetrospective && (
        <p className="px-1 text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
          {lockedPhotoCopy()}
        </p>
      )}

      <div className="px-1">
        <label htmlFor="caption" className="mb-1 block text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
          Caption
        </label>
        <textarea
          id="caption"
          value={captionValue}
          maxLength={CAPTION_MAX}
          onChange={(e) => setCaption(e.target.value)}
          onBlur={saveCaption}
          rows={3}
          className="w-full rounded-xl border border-[var(--color-line)] bg-transparent p-3 dark:border-[var(--color-line-dark)]"
          placeholder="Optional"
        />
      </div>

      {error && <p className="px-1 text-sm text-red-600" role="alert">{error}</p>}

      <div className="flex flex-col items-center gap-2 px-1">
        <button
          type="button"
          onClick={() => navigate(`/story/${memory.id}`)}
          className="min-h-11 w-full rounded-full bg-[var(--color-accent)] px-4 py-2 font-medium text-white"
        >
          Share
        </button>
        {deletable && (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="min-h-11 px-3 text-sm text-red-600/80 hover:text-red-600"
          >
            Delete memory
          </button>
        )}
      </div>

      {confirmingDelete && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-[var(--color-paper)] p-6 dark:bg-[var(--color-paper-dark)]">
            <h2 id="delete-confirm-title" className="font-serif text-xl">
              Delete this memory?
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
              This cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="min-h-11 flex-1 rounded-full border border-[var(--color-line)] px-4 py-2 dark:border-[var(--color-line-dark)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleDelete}
                className="min-h-11 flex-1 rounded-full bg-red-600 px-4 py-2 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
