import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { memoryStorageService, notificationService } from '@/services'
import { markOnboardingComplete } from '@/features/onboarding/onboardingStore'

interface Screen {
  title: string
  copy: string
}

const SCREENS: Screen[] = [
  {
    title: 'Notice your life.',
    copy: 'One thoughtful prompt each morning gives you something meaningful to notice.',
  },
  {
    title: 'Live first. Reflect later.',
    copy: 'There is no need to interrupt the moment. Return later and choose what deserves to represent your day.',
  },
  {
    title: 'Private by design.',
    copy: 'No likes. No followers. No audience. Your memories stay on this device.',
  },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [askingReminders, setAskingReminders] = useState(false)

  async function finishOnboarding() {
    await memoryStorageService.updateSettings({ onboardingCompleted: true })
    markOnboardingComplete()
    navigate('/today', { replace: true })
  }

  async function enableReminders(enable: boolean) {
    if (enable && notificationService.isSupported()) {
      await notificationService.requestPermission()
    }
    await memoryStorageService.updateSettings({
      morningReminderEnabled: enable,
      eveningReminderEnabled: enable,
    })
    await finishOnboarding()
  }

  if (askingReminders) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-8 px-8 text-center">
        <h1 className="font-serif text-3xl text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">
          Gentle daily reminders?
        </h1>
        <p className="max-w-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
          A morning prompt and an evening moment to reflect. You can change or turn these
          off anytime in Settings.
          {!notificationService.isSupported() && (
            <span className="mt-2 block text-sm">
              Native reminders require running the app on a device — the browser preview
              cannot schedule them.
            </span>
          )}
        </p>
        <div className="flex w-full max-w-sm flex-col gap-3">
          <button
            type="button"
            onClick={() => enableReminders(true)}
            className="min-h-11 rounded-full bg-[var(--color-accent)] px-6 py-3 font-medium text-white"
          >
            Enable reminders
          </button>
          <button
            type="button"
            onClick={() => enableReminders(false)}
            className="min-h-11 rounded-full px-6 py-3 text-[var(--color-muted)]"
          >
            Not now
          </button>
        </div>
      </div>
    )
  }

  const screen = SCREENS[step]
  const isLast = step === SCREENS.length - 1

  return (
    <div className="flex h-full flex-col justify-between px-8 py-12 text-center">
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <h1 className="font-serif text-4xl leading-tight text-[var(--color-ink)] dark:text-[var(--color-ink-dark)]">
          {screen.title}
        </h1>
        <p className="max-w-sm text-lg text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
          {screen.copy}
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-2" role="tablist" aria-label="Onboarding progress">
          {SCREENS.map((s, i) => (
            <span
              key={s.title}
              aria-current={i === step}
              className={`h-1.5 w-6 rounded-full ${i === step ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-line)] dark:bg-[var(--color-line-dark)]'}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => (isLast ? setAskingReminders(true) : setStep((s) => s + 1))}
          className="min-h-11 w-full max-w-sm rounded-full bg-[var(--color-accent)] px-6 py-3 font-medium text-white"
        >
          {isLast ? 'Start noticing' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
