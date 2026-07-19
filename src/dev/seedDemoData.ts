import { memoryStorageService, photoService } from '@/services'
import { promptForDate } from '@/features/prompts/promptEngine'
import { addDays, todayLocalDate } from '@/utils/date'
import type { MemoryType } from '@/types/memory'

const CAPTIONS_SHORT = [
  'A good, ordinary day.',
  'Coffee on the porch.',
  'Rain most of the afternoon.',
  'Quiet, in a nice way.',
  '',
]

const CAPTIONS_LONG = [
  'I almost forgot to notice this, but the light coming through the kitchen window while everyone else was still asleep felt like it belonged only to me for a few minutes.',
  'Nothing remarkable happened today, and that is exactly why I wanted to remember it — the kind of ordinary that quietly adds up to a life.',
]

type AspectRatio = 'portrait' | 'landscape' | 'square'

function placeholderDataUrl(aspect: AspectRatio, seed: number): string {
  const sizes: Record<AspectRatio, [number, number]> = {
    portrait: [600, 800],
    landscape: [800, 600],
    square: [700, 700],
  }
  const [w, h] = sizes[aspect]
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const hue = (seed * 47) % 360
  ctx.fillStyle = `hsl(${hue}, 45%, 70%)`
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = `hsl(${hue}, 45%, 45%)`
  ctx.fillRect(0, h * 0.6, w, h * 0.4)
  return canvas.toDataURL('image/jpeg', 0.8)
}

/**
 * Dev-only utility: seeds ~20 demo memories across the previous 30-45 days,
 * including gaps, retrospective entries, and varied caption lengths/aspect
 * ratios. Never bundled into production — call only from import.meta.env.DEV
 * code paths.
 */
export async function seedDemoData(): Promise<number> {
  if (!import.meta.env.DEV) {
    throw new Error('seedDemoData is only available in development builds')
  }

  const today = todayLocalDate()
  const aspects: AspectRatio[] = ['portrait', 'landscape', 'square']
  let created = 0

  // Pick ~20 offsets out of the last 30-45 days, leaving deliberate gaps.
  const totalRange = 40
  const offsets = Array.from({ length: totalRange }, (_, i) => i + 1).filter(
    (_, i) => i % 2 === 0,
  ) // every other day => ~20 candidates

  for (let i = 0; i < offsets.length; i++) {
    const offset = offsets[i]
    const date = addDays(today, -offset)
    const existing = await memoryStorageService.getMemoryByDate(date)
    if (existing) continue

    const isRetrospective = i % 6 === 0 // roughly every 6th seeded entry
    const type: MemoryType = isRetrospective ? 'retrospective' : 'daily'
    const aspect = aspects[i % aspects.length]
    const caption =
      i % 5 === 4 ? undefined : i % 7 === 0 ? CAPTIONS_LONG[i % CAPTIONS_LONG.length] : CAPTIONS_SHORT[i % CAPTIONS_SHORT.length]

    const dataUrl = placeholderDataUrl(aspect, i)
    const id = crypto.randomUUID()
    const { photoPath, thumbnailPath } = await photoService.processAndSave(dataUrl, id)
    const prompt = type === 'daily' ? promptForDate(date) : undefined
    const now = new Date().toISOString()

    await memoryStorageService.createMemory({
      id,
      date,
      type,
      promptId: prompt?.id,
      promptTextSnapshot: prompt?.text,
      photoPath,
      thumbnailPath,
      caption: caption || undefined,
      createdAt: now,
      updatedAt: now,
      addedAt: now,
    })
    created++
  }

  return created
}
