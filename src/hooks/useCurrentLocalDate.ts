import { useEffect, useState } from 'react'
import { platformService } from '@/services'
import { todayLocalDate } from '@/utils/date'

/**
 * Tracks today's local-calendar date, refreshing when the app resumes from
 * the background and via a midnight-crossing timer while foregrounded — so
 * the Today screen never shows a stale prompt after the clock rolls over.
 */
export function useCurrentLocalDate(): string {
  const [date, setDate] = useState(todayLocalDate())

  useEffect(() => {
    const refresh = () => setDate(todayLocalDate())

    const unsubscribe = platformService.addLifecycleListeners({
      onResume: refresh,
    })

    function scheduleMidnightTick() {
      const now = new Date()
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5)
      const ms = nextMidnight.getTime() - now.getTime()
      return window.setTimeout(() => {
        refresh()
        scheduleMidnightTick()
      }, ms)
    }
    const timer = scheduleMidnightTick()

    return () => {
      unsubscribe()
      window.clearTimeout(timer)
    }
  }, [])

  return date
}
