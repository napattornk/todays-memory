import MemoryCardTemplate from './MemoryCardTemplate'
import PolaroidTemplate from './PolaroidTemplate'
import JournalTemplate from './JournalTemplate'
import type { StoryTemplateId } from '@/types/memory'
import type { ComponentType } from 'react'
import type { StoryMemoryViewModel } from '@/features/sharing/types'

export interface StoryTemplateMeta {
  id: StoryTemplateId
  name: string
  description: string
  Component: ComponentType<{ model: StoryMemoryViewModel; ref?: React.Ref<HTMLDivElement> }>
}

export const STORY_TEMPLATES: StoryTemplateMeta[] = [
  {
    id: 'memory-card',
    name: 'Memory Card',
    description: 'Minimal, modern, editorial.',
    Component: MemoryCardTemplate,
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
    description: 'Warm and nostalgic, instant-photo inspired.',
    Component: PolaroidTemplate,
  },
  {
    id: 'journal',
    name: 'Journal',
    description: 'Calm, reflective notebook page.',
    Component: JournalTemplate,
  },
]
