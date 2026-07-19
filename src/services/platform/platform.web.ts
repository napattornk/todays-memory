import type { PlatformService, LifecycleListeners } from './types'

export function createWebPlatformService(): PlatformService {
  return {
    platform: 'web',
    isNative: false,
    addLifecycleListeners(listeners: LifecycleListeners) {
      const handleVisibility = () => {
        if (document.visibilityState === 'visible') listeners.onResume?.()
        else listeners.onPause?.()
      }
      document.addEventListener('visibilitychange', handleVisibility)

      // Browser back button (popstate) is handled by the router itself;
      // there is no hardware back button to intercept on web.
      return () => {
        document.removeEventListener('visibilitychange', handleVisibility)
      }
    },
  }
}
