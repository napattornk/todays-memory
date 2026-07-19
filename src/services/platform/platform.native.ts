import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import type { PlatformService, LifecycleListeners, AppPlatform } from './types'

export function createNativePlatformService(): PlatformService {
  return {
    platform: Capacitor.getPlatform() as AppPlatform,
    isNative: Capacitor.isNativePlatform(),
    addLifecycleListeners(listeners: LifecycleListeners) {
      const subs: { remove: () => void }[] = []

      if (listeners.onResume || listeners.onPause) {
        App.addListener('appStateChange', ({ isActive }) => {
          if (isActive) listeners.onResume?.()
          else listeners.onPause?.()
        }).then((h) => subs.push(h))
      }

      if (listeners.onBackButton) {
        App.addListener('backButton', () => {
          const shouldExit = listeners.onBackButton?.()
          if (shouldExit) {
            App.exitApp()
          }
        }).then((h) => subs.push(h))
      }

      return () => {
        subs.forEach((s) => s.remove())
      }
    },
  }
}
