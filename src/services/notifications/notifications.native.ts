import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'
import type { NotificationService, NotificationPermissionState, ReminderPreferences } from './types'

const MORNING_ID = 1001
const EVENING_ID = 1002

function parseTime(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(':').map(Number)
  return { hour, minute }
}

export function createNativeNotificationService(): NotificationService {
  return {
    isSupported() {
      return Capacitor.isNativePlatform()
    },

    async requestPermission() {
      const { display } = await LocalNotifications.requestPermissions()
      return display as NotificationPermissionState
    },

    async getPermissionState() {
      const { display } = await LocalNotifications.checkPermissions()
      return display as NotificationPermissionState
    },

    async syncSchedule(prefs: ReminderPreferences) {
      await LocalNotifications.cancel({ notifications: [{ id: MORNING_ID }, { id: EVENING_ID }] })

      const toSchedule = []
      if (prefs.morningEnabled) {
        const { hour, minute } = parseTime(prefs.morningTime)
        toSchedule.push({
          id: MORNING_ID,
          title: "Today's Memory",
          body: 'Carry this with you. Come back when you know what today meant.',
          schedule: { on: { hour, minute }, repeats: true, allowWhileIdle: true },
        })
      }
      if (prefs.eveningEnabled) {
        const { hour, minute } = parseTime(prefs.eveningTime)
        toSchedule.push({
          id: EVENING_ID,
          title: "Today's Memory",
          body: 'Before today ends, what deserves to be remembered?',
          schedule: { on: { hour, minute }, repeats: true, allowWhileIdle: true },
        })
      }

      if (toSchedule.length > 0) {
        await LocalNotifications.schedule({ notifications: toSchedule })
      }
    },

    async cancelAll() {
      await LocalNotifications.cancel({ notifications: [{ id: MORNING_ID }, { id: EVENING_ID }] })
    },
  }
}
