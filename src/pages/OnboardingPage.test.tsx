import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import OnboardingPage from './OnboardingPage'

const updateSettings = vi.fn().mockResolvedValue(undefined)

vi.mock('@/services', () => ({
  memoryStorageService: { updateSettings: (...args: unknown[]) => updateSettings(...args) },
  notificationService: { isSupported: () => false, requestPermission: vi.fn() },
}))

function renderOnboarding() {
  return render(
    <MemoryRouter initialEntries={['/onboarding']}>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/today" element={<div>Today screen</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => updateSettings.mockClear())

describe('OnboardingPage', () => {
  it('walks through all three screens with the exact required copy', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    expect(screen.getByText('Notice your life.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByText('Live first. Reflect later.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByText('Private by design.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start noticing' })).toBeInTheDocument()
  })

  it('completes onboarding without requiring reminders to be enabled', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByRole('button', { name: 'Start noticing' }))

    await user.click(screen.getByRole('button', { name: 'Not now' }))

    expect(updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ morningReminderEnabled: false, eveningReminderEnabled: false }),
    )
    expect(updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ onboardingCompleted: true }),
    )
    expect(await screen.findByText('Today screen')).toBeInTheDocument()
  })
})
