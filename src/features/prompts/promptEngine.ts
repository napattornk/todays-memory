import type { LocalDate } from '@/types/memory'
import type { Prompt } from '@/types/prompt'
import { PROMPTS } from '@/data/prompts/prompts'

/**
 * djb2 string hash. Deterministic across platforms/runs (unlike relying on
 * Array.sort or object iteration order), which is what makes date -> prompt
 * assignment reproducible.
 */
function djb2Hash(input: string): number {
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i)
  }
  return hash >>> 0
}

/**
 * Returns the prompt assigned to a given local date. Purely a function of
 * (date, PROMPTS.length) — same date always yields the same prompt, and the
 * result does not depend on the order prompts are declared in, since PROMPTS
 * is pre-sorted by stable id in data/prompts/prompts.ts.
 */
export function promptForDate(date: LocalDate, prompts: Prompt[] = PROMPTS): Prompt {
  if (prompts.length === 0) {
    throw new Error('Prompt library is empty')
  }
  const hash = djb2Hash(date)
  const index = hash % prompts.length
  return prompts[index]
}
