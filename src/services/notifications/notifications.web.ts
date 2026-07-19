import type { NotificationService } from './types'

export function createWebNotificationService(): NotificationService {
  return {
    isSupported() {
      return false
    },
    async requestPermission() {
      return 'unsupported'
    },
    async getPermissionState() {
      return 'unsupported'
    },
    async syncSchedule() {
      // Intentionally a no-op: browser notification scheduling is unreliable
      // (especially on iOS Safari) and this app never simulates native
      // reminders. The Settings UI must explain that reminders require a
      // real device build.
    },
    async cancelAll() {
      // no-op
    },
  }
}
