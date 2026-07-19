import { useSyncExternalStore } from 'react'

/**
 * Minimal module-level toast store, mounted once at the app root so it
 * survives route changes (a save action navigates away immediately after
 * showing the toast). Deliberately plain text, no confetti/animation per
 * product tone — just a quiet confirmation that the save happened.
 */
let message: string | null = null
let hideTimer: number | undefined
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

export function showToast(text: string, durationMs = 2500) {
  message = text
  notify()
  window.clearTimeout(hideTimer)
  hideTimer = window.setTimeout(() => {
    message = null
    notify()
  }, durationMs)
}

export function useToastMessage(): string | null {
  return useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange)
      return () => listeners.delete(onChange)
    },
    () => message,
  )
}
