import type { MemoryType, StoryBackground } from '@/types/memory'

export interface StoryMemoryViewModel {
  dateLabel: string
  memoryType: MemoryType
  promptOrReflectionLabel: string
  caption?: string
  photoUrl: string
  background: StoryBackground
}

export const STORY_BACKGROUND_COLORS: Record<StoryBackground, { bg: string; ink: string }> = {
  white: { bg: '#ffffff', ink: '#1a1a1a' },
  cream: { bg: '#f4ecdd', ink: '#241f28' },
  black: { bg: '#141214', ink: '#f4ecdd' },
  'warm-beige': { bg: '#ecdfc8', ink: '#241f28' },
}
