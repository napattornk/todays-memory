export type MemoryType = 'daily' | 'retrospective'

export type StoryBackground = 'white' | 'cream' | 'black' | 'warm-beige'

export type StoryTemplateId = 'memory-card' | 'polaroid' | 'journal'

/** ISO local calendar date, `YYYY-MM-DD`. Never a UTC/instant timestamp. */
export type LocalDate = string

export interface Memory {
  id: string
  date: LocalDate
  type: MemoryType

  promptId?: string
  promptTextSnapshot?: string

  /** Path (native) or object-URL-able key (web fallback) for the full-size image. */
  photoPath: string
  /** Path/key for the generated thumbnail. */
  thumbnailPath: string

  caption?: string

  createdAt: string
  updatedAt: string
  addedAt: string
}

export interface AppSettings {
  onboardingCompleted: boolean
  morningReminderEnabled: boolean
  morningReminderTime: string
  eveningReminderEnabled: boolean
  eveningReminderTime: string
  preferredStoryBackground: StoryBackground
  schemaVersion: number
}

export const DEFAULT_SETTINGS: AppSettings = {
  onboardingCompleted: false,
  morningReminderEnabled: true,
  morningReminderTime: '08:00',
  eveningReminderEnabled: true,
  eveningReminderTime: '21:00',
  preferredStoryBackground: 'cream',
  schemaVersion: 1,
}
