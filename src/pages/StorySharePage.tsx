import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toBlob } from 'html-to-image'
import { useMemoryById } from '@/hooks/useMemories'
import { usePhotoUrl } from '@/hooks/usePhotoUrl'
import { useSettings } from '@/hooks/useSettings'
import { shareService } from '@/services'
import { STORY_TEMPLATES } from '@/features/sharing/templates'
import { buildStoryViewModel } from '@/features/sharing/buildStoryViewModel'
import { STORY_WIDTH, STORY_HEIGHT, blobToDataUrl } from '@/utils/image'
import type { StoryBackground, StoryTemplateId } from '@/types/memory'

const BACKGROUNDS: StoryBackground[] = ['white', 'cream', 'black', 'warm-beige']
const PREVIEW_WIDTH = 280

export default function StorySharePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { memory, loading } = useMemoryById(id)
  const { settings } = useSettings()
  const photoUrl = usePhotoUrl(memory?.photoPath)
  const nodeRef = useRef<HTMLDivElement>(null)

  const [templateId, setTemplateId] = useState<StoryTemplateId>('memory-card')
  const [background, setBackground] = useState<StoryBackground | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined)

  const effectiveBackground = background ?? settings.preferredStoryBackground

  useEffect(() => {
    // html-to-image needs to embed the photo as pixel data during capture.
    // Handing it a blob:/native-asset URL makes it re-fetch that resource
    // internally, which silently fails for local blob/asset schemes and
    // leaves the photo missing from the generated Story image. Pre-resolving
    // to a data: URL here means there's nothing left to fetch — the image is
    // already inline.
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting before an async refetch, not deriving render state
    setPhotoDataUrl(undefined)
    if (!photoUrl) return
    fetch(photoUrl)
      .then((res) => res.blob())
      .then(blobToDataUrl)
      .then((dataUrl) => {
        if (!cancelled) setPhotoDataUrl(dataUrl)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load this memory’s photo for the Story preview.')
      })
    return () => {
      cancelled = true
    }
  }, [photoUrl])

  const model = useMemo(() => {
    if (!memory || !photoDataUrl) return null
    return buildStoryViewModel(memory, photoDataUrl, effectiveBackground)
  }, [memory, photoDataUrl, effectiveBackground])

  const Template = STORY_TEMPLATES.find((t) => t.id === templateId)!.Component

  async function generateBlob(): Promise<Blob> {
    if (!nodeRef.current) throw new Error('Nothing to render yet.')
    // Ensure images inside the node have finished loading before capture.
    const images = Array.from(nodeRef.current.querySelectorAll('img'))
    await Promise.all(
      images.map((img) =>
        img.complete ? Promise.resolve() : new Promise((res) => (img.onload = img.onerror = res)),
      ),
    )
    if (document.fonts?.ready) await document.fonts.ready

    const blob = await toBlob(nodeRef.current, {
      width: STORY_WIDTH,
      height: STORY_HEIGHT,
      pixelRatio: 1,
    })
    if (!blob) throw new Error('Could not generate the Story image. Try again.')
    return blob
  }

  async function handleShare() {
    setBusy(true)
    setError(null)
    setInfo(null)
    let preparedPath: string | null = null
    try {
      const blob = await generateBlob()
      const { path } = await shareService.prepareGeneratedImage(blob, `story-${Date.now()}.png`)
      preparedPath = path
      const result = await shareService.shareImage({ path, title: "Today's Memory" })
      if (!result.shared) setInfo('Share was cancelled.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not share the Story image. Save image and upload it to Instagram Stories manually.',
      )
    } finally {
      if (preparedPath) await shareService.cleanupGeneratedImage(preparedPath)
      setBusy(false)
    }
  }

  async function handleSaveToGallery() {
    setBusy(true)
    setError(null)
    setInfo(null)
    let preparedPath: string | null = null
    try {
      const blob = await generateBlob()
      const { path } = await shareService.prepareGeneratedImage(blob, `story-${Date.now()}.png`)
      preparedPath = path
      const result = await shareService.saveImageToGallery(path)
      setInfo(result.reason ?? (result.saved ? 'Saved.' : null))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the Story image.')
    } finally {
      if (preparedPath) await shareService.cleanupGeneratedImage(preparedPath)
      setBusy(false)
    }
  }

  if (loading || !memory) return null

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto py-6" style={{ paddingTop: 'var(--safe-top)' }}>
      <div className="flex items-center justify-between px-1">
        <button type="button" onClick={() => navigate(-1)} className="min-h-11 min-w-11 text-[var(--color-muted)]">
          ← Back
        </button>
        <h1 className="font-serif text-xl">Choose a Story Template</h1>
        <span className="w-11" />
      </div>

      <div className="flex justify-center">
        {model && (
          <div
            style={{
              width: PREVIEW_WIDTH,
              height: (PREVIEW_WIDTH / STORY_WIDTH) * STORY_HEIGHT,
              overflow: 'hidden',
              borderRadius: 16,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}
          >
            <div
              style={{
                width: STORY_WIDTH,
                height: STORY_HEIGHT,
                transform: `scale(${PREVIEW_WIDTH / STORY_WIDTH})`,
                transformOrigin: 'top left',
              }}
            >
              {/* Visual-only preview. Not the capture target — see note below. */}
              <Template model={model} />
            </div>
          </div>
        )}
      </div>

      {/*
        html-to-image captures whatever is actually laid out in the DOM. A
        node nested inside a scaled + overflow:hidden preview wrapper only
        has its small clipped on-screen area available to capture, so most
        of the 1080x1920 image (including the photo, which sits lower in
        every template) came out blank. This full-size, unscaled, unclipped
        copy — parked off-screen rather than visually shown — is the actual
        capture source, decoupled from the preview above.
      */}
      {model && (
        <div style={{ position: 'fixed', top: 0, left: -99999, pointerEvents: 'none' }} aria-hidden="true">
          <Template model={model} ref={nodeRef} />
        </div>
      )}

      <div className="flex justify-center gap-3 px-1" role="tablist" aria-label="Story template">
        {STORY_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={templateId === t.id}
            onClick={() => setTemplateId(t.id)}
            className={`min-h-11 rounded-full border px-4 py-2 text-sm ${
              templateId === t.id
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                : 'border-[var(--color-line)] dark:border-[var(--color-line-dark)]'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-3 px-1" role="group" aria-label="Background">
        {BACKGROUNDS.map((bg) => (
          <button
            key={bg}
            type="button"
            aria-label={bg}
            aria-pressed={effectiveBackground === bg}
            onClick={() => setBackground(bg)}
            className={`h-11 w-11 rounded-full border-2 ${
              effectiveBackground === bg ? 'border-[var(--color-accent)]' : 'border-transparent'
            }`}
            style={{
              background:
                bg === 'white' ? '#fff' : bg === 'cream' ? '#f4ecdd' : bg === 'black' ? '#141214' : '#ecdfc8',
            }}
          />
        ))}
      </div>

      {error && <p className="px-1 text-sm text-red-600" role="alert">{error}</p>}
      {info && <p className="px-1 text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">{info}</p>}

      <div className="flex flex-col gap-3 px-1">
        <button
          type="button"
          disabled={busy || !model}
          onClick={handleShare}
          className="min-h-11 rounded-full bg-[var(--color-accent)] px-6 py-3 font-medium text-white disabled:opacity-50"
        >
          {busy ? 'Preparing…' : 'Share Story'}
        </button>
        <button
          type="button"
          disabled={busy || !model}
          onClick={handleSaveToGallery}
          className="min-h-11 rounded-full border border-[var(--color-line)] px-6 py-3 disabled:opacity-50 dark:border-[var(--color-line-dark)]"
        >
          Save image
        </button>
      </div>
    </div>
  )
}
