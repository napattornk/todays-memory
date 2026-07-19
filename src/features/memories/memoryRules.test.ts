import { describe, expect, it } from 'vitest'
import { isCaptionEditable, isDeletable, isPhotoLocked } from './memoryRules'

const today = '2026-07-19'

describe('isPhotoLocked', () => {
  it('is unlocked for a daily memory within the grace period', () => {
    expect(isPhotoLocked({ date: '2026-07-14', type: 'daily' }, today)).toBe(false)
  })

  it('is locked for a daily memory outside the grace period', () => {
    expect(isPhotoLocked({ date: '2026-06-01', type: 'daily' }, today)).toBe(true)
  })

  it('never locks a retrospective memory', () => {
    expect(isPhotoLocked({ date: '2020-01-01', type: 'retrospective' }, today)).toBe(false)
  })
})

describe('isCaptionEditable', () => {
  it('remains editable after the photo locks', () => {
    expect(isCaptionEditable({ date: '2020-01-01', type: 'daily' })).toBe(true)
  })
})

describe('isDeletable', () => {
  it('locked daily memories are not deletable', () => {
    expect(isDeletable({ date: '2026-06-01', type: 'daily' }, today)).toBe(false)
  })

  it('daily memories within the grace period are deletable', () => {
    expect(isDeletable({ date: '2026-07-19', type: 'daily' }, today)).toBe(true)
  })

  it('retrospective memories are always deletable', () => {
    expect(isDeletable({ date: '2020-01-01', type: 'retrospective' }, today)).toBe(true)
  })
})
