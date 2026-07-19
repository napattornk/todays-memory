import { useSyncExternalStore } from 'react'
import { memoryStorageService } from '@/services'

/**
 * Small shared store for onboarding status. App.tsx's route Gate and
 * OnboardingPage are separate components; without this, completing
 * onboarding (an async settings write) and immediately navigating away
 * races against the Gate's own stale local state, which can bounce the
 * user back to onboarding right after they finish it.
 */
let onboarded: boolean | null = null
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

export async function loadOnboardingStatus(): Promise<boolean> {
  const settings = await memoryStorageService.getSettings()
  onboarded = settings.onboardingCompleted
  notify()
  return onboarded
}

export function markOnboardingComplete() {
  onboarded = true
  notify()
}

export function useOnboardingStatus(): boolean | null {
  return useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange)
      return () => listeners.delete(onChange)
    },
    () => onboarded,
  )
}
