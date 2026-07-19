export type AppPlatform = 'ios' | 'android' | 'web'

export interface LifecycleListeners {
  onResume?: () => void
  onPause?: () => void
  /** Return true to let the platform handle the back press (e.g. exit app). */
  onBackButton?: () => boolean
}

export interface PlatformService {
  platform: AppPlatform
  isNative: boolean
  /** Registers app lifecycle + Android hardware back-button listeners. Returns an unsubscribe fn. */
  addLifecycleListeners(listeners: LifecycleListeners): () => void
}
