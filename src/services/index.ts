import { Capacitor } from '@capacitor/core'

export * from './platform/types'
export * from './photo/types'
export * from './memory-storage/types'
export * from './share/types'
export * from './notifications/types'
export * from './backup/types'

import type { PlatformService } from './platform/types'
import type { PhotoService } from './photo/types'
import type { MemoryStorageService } from './memory-storage/types'
import type { ShareService } from './share/types'
import type { NotificationService } from './notifications/types'
import type { BackupService } from './backup/types'

const isNative = Capacitor.isNativePlatform()

// Native Capacitor plugin modules (e.g. @capacitor-community/sqlite) run
// side effects at import time — plugin registration, and in some cases
// their own IndexedDB-backed storage setup. Dynamic, platform-gated imports
// ensure that code never even loads in the browser dev build, instead of
// merely going unused.
export const platformService: PlatformService = isNative
  ? (await import('./platform/platform.native')).createNativePlatformService()
  : (await import('./platform/platform.web')).createWebPlatformService()

export const photoService: PhotoService = isNative
  ? (await import('./photo/photo.native')).createNativePhotoService()
  : (await import('./photo/photo.web')).createWebPhotoService()

export const memoryStorageService: MemoryStorageService = isNative
  ? (await import('./memory-storage/memory-storage.native')).createNativeMemoryStorageService()
  : (await import('./memory-storage/memory-storage.web')).createWebMemoryStorageService()

export const shareService: ShareService = isNative
  ? (await import('./share/share.native')).createNativeShareService()
  : (await import('./share/share.web')).createWebShareService()

export const notificationService: NotificationService = isNative
  ? (await import('./notifications/notifications.native')).createNativeNotificationService()
  : (await import('./notifications/notifications.web')).createWebNotificationService()

export const backupService: BackupService = isNative
  ? (await import('./backup/backup.native')).createNativeBackupService()
  : (await import('./backup/backup.web')).createWebBackupService()
