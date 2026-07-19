export type PromptCategory =
  | 'notice'
  | 'gratitude'
  | 'people'
  | 'place'
  | 'change'
  | 'emotion'
  | 'growth'
  | 'ordinary-life'

export interface Prompt {
  id: string
  text: string
  category: PromptCategory
  tone?: string
  rotationIndex: number
}
