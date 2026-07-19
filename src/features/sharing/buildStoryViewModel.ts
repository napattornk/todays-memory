import type { MemoryRecord } from '@/db/schema'
import type { StoryBackground } from '@/types/memory'
import { formatDateLabel } from '@/utils/date'
import type { StoryMemoryViewModel } from './types'

export function buildStoryViewModel(
  memory: Pick<MemoryRecord, 'date' | 'type' | 'promptTextSnapshot' | 'caption'>,
  photoUrl: string,
  background: StoryBackground,
): StoryMemoryViewModel {
  return {
    dateLabel: formatDateLabel(memory.date),
    memoryType: memory.type,
    promptOrReflectionLabel:
      memory.type === 'retrospective' ? 'Looking back…' : (memory.promptTextSnapshot ?? ''),
    caption: memory.caption,
    photoUrl,
    background,
  }
}
