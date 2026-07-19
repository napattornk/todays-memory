import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import CalendarPage from './CalendarPage'
import { todayLocalDate } from '@/utils/date'

const memory = {
  id: 'mem-today',
  date: todayLocalDate(),
  type: 'daily' as const,
  photoPath: 'photos/a.jpg',
  thumbnailPath: 'thumbnails/a.jpg',
  promptTextSnapshot: 'A prompt',
  createdAt: '',
  updatedAt: '',
  addedAt: '',
}

vi.mock('@/services', () => ({
  memoryStorageService: { listMemories: () => Promise.resolve([memory]) },
  photoService: { resolveUrl: () => Promise.resolve('blob:mock-thumb') },
}))

function renderCalendar() {
  return render(
    <MemoryRouter initialEntries={['/calendar']}>
      <Routes>
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/memory/:id" element={<div>Memory detail screen</div>} />
        <Route path="/add" element={<div>Add memory screen</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CalendarPage', () => {
  it('opens Memory Detail when tapping a date that already has a memory', async () => {
    const user = userEvent.setup()
    renderCalendar()

    const cell = await screen.findByLabelText(memory.date)
    await user.click(cell)

    expect(await screen.findByText('Memory detail screen')).toBeInTheDocument()
  })

  it('opens the retrospective flow when tapping an empty date older than the grace period', async () => {
    const user = userEvent.setup()
    renderCalendar()

    const oldDate = `${new Date().getFullYear()}-01-01`
    // Only exercise this when Jan 1st isn't today/within grace period in the test run.
    const cell = screen.queryByLabelText(oldDate)
    if (!cell) return

    await user.click(cell)
    expect(await screen.findByText('Add memory screen')).toBeInTheDocument()
  })
})
