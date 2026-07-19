import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppShell from '@/app/AppShell'
import OnboardingPage from '@/pages/OnboardingPage'
import TodayPage from '@/pages/TodayPage'
import MemoriesPage from '@/pages/MemoriesPage'
import CalendarPage from '@/pages/CalendarPage'
import MemoryDetailPage from '@/pages/MemoryDetailPage'
import AddMemoryPage from '@/pages/AddMemoryPage'
import SettingsPage from '@/pages/SettingsPage'
import StorySharePage from '@/pages/StorySharePage'
import { memoryStorageService, notificationService, platformService } from '@/services'
import { loadOnboardingStatus, useOnboardingStatus } from '@/features/onboarding/onboardingStore'
import ToastHost from '@/features/toast/ToastHost'

function Gate({ children }: { children: React.ReactNode }) {
  const onboarded = useOnboardingStatus()
  const location = useLocation()

  useEffect(() => {
    memoryStorageService.init().then(async () => {
      const onboardingCompleted = await loadOnboardingStatus()
      const settings = await memoryStorageService.getSettings()
      if (onboardingCompleted && notificationService.isSupported()) {
        notificationService.syncSchedule({
          morningEnabled: settings.morningReminderEnabled,
          morningTime: settings.morningReminderTime,
          eveningEnabled: settings.eveningReminderEnabled,
          eveningTime: settings.eveningReminderTime,
        })
      }
    })
  }, [])

  useEffect(() => {
    // Timezone/DST changes don't fire a JS event on their own; re-sync the
    // schedule whenever the app resumes so a shifted local clock is honored.
    return platformService.addLifecycleListeners({
      onResume: async () => {
        const settings = await memoryStorageService.getSettings()
        if (settings.onboardingCompleted && notificationService.isSupported()) {
          notificationService.syncSchedule({
            morningEnabled: settings.morningReminderEnabled,
            morningTime: settings.morningReminderTime,
            eveningEnabled: settings.eveningReminderEnabled,
            eveningTime: settings.eveningReminderTime,
          })
        }
      },
    })
  }, [])

  // null = status not loaded yet (startup); don't render or redirect until known.
  if (onboarded === null) return null
  if (!onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <HashRouter>
      <ToastHost />
      <Gate>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route element={<AppShell />}>
            <Route path="/today" element={<TodayPage />} />
            <Route path="/memories" element={<MemoriesPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
          </Route>
          <Route path="/memory/:id" element={<MemoryDetailPage />} />
          <Route path="/add" element={<AddMemoryPage />} />
          <Route path="/story/:id" element={<StorySharePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
      </Gate>
    </HashRouter>
  )
}

export default App
