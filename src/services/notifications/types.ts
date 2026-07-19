export type NotificationPermissionState = 'granted' | 'denied' | 'unsupported'

export interface ReminderPreferences {
  morningEnabled: boolean
  morningTime: string // "HH:mm"
  eveningEnabled: boolean
  eveningTime: string // "HH:mm"
}

export interface NotificationService {
  /** Whether local notifications can run at all on this platform/build. */
  isSupported(): boolean
  requestPermission(): Promise<NotificationPermissionState>
  getPermissionState(): Promise<NotificationPermissionState>
  /**
   * Cancels any previously scheduled morning/evening reminders and
   * reschedules them from the given preferences. Safe to call whenever
   * preferences change, on app start, and after detecting a date/timezone
   * change — it always fully replaces the existing schedule.
   */
  syncSchedule(prefs: ReminderPreferences): Promise<void>
  cancelAll(): Promise<void>
}
