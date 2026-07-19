import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '@/hooks/useSettings'
import { notificationService, backupService, shareService } from '@/services'
import { buildBackupArchive, backupFilename } from '@/features/backup/exportBackup'
import {
  loadAndValidateBackup,
  applyImport,
  type ImportPreview,
  type ConflictResolution,
} from '@/features/backup/importBackup'
import { deleteAllLocalData } from '@/features/backup/deleteAllData'
import { seedDemoData } from '@/dev/seedDemoData'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { settings, update } = useSettings()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [resolutions, setResolutions] = useState<Record<string, ConflictResolution>>({})
  const [confirmingDeleteAll, setConfirmingDeleteAll] = useState(false)

  const notificationsSupported = notificationService.isSupported()

  async function syncReminders(patch: Partial<typeof settings>) {
    const next = await update(patch)
    if (notificationsSupported) {
      await notificationService.syncSchedule({
        morningEnabled: next.morningReminderEnabled,
        morningTime: next.morningReminderTime,
        eveningEnabled: next.eveningReminderEnabled,
        eveningTime: next.eveningReminderTime,
      })
    }
  }

  async function handleExport() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const bytes = await buildBackupArchive()
      const { path } = await backupService.writeArchive(bytes, backupFilename())
      await shareService.shareImage({ path, title: "Today's Memory Backup" })
      setMessage('Backup exported.')
    } catch {
      setError('Could not export your backup. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function handlePickImport() {
    setError(null)
    setMessage(null)
    const file = await backupService.pickArchive()
    if (!file) return
    setBusy(true)
    try {
      const result = await loadAndValidateBackup(file.data)
      setPreview(result)
      const defaults: Record<string, ConflictResolution> = {}
      for (const date of result.conflictDates) defaults[date] = 'skip'
      setResolutions(defaults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read this backup file.')
    } finally {
      setBusy(false)
    }
  }

  async function handleApplyImport() {
    if (!preview) return
    setBusy(true)
    setError(null)
    try {
      const count = await applyImport({ preview, resolutions })
      setMessage(`Imported ${count} ${count === 1 ? 'memory' : 'memories'}.`)
      setPreview(null)
    } catch {
      setError('The import could not be completed. Nothing was changed.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDeleteAll() {
    setBusy(true)
    setConfirmingDeleteAll(false)
    try {
      await deleteAllLocalData()
      setMessage('All local data has been deleted.')
    } finally {
      setBusy(false)
    }
  }

  if (preview) {
    return (
      <div className="flex h-full flex-col gap-4 overflow-y-auto p-6" style={{ paddingTop: 'var(--safe-top)' }}>
        <h1 className="font-serif text-2xl">Import backup</h1>
        <p>
          This backup contains {preview.totalCount} {preview.totalCount === 1 ? 'memory' : 'memories'}.
        </p>
        {preview.conflictDates.length > 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
              {preview.conflictDates.length} date(s) already have a memory. Choose what to do:
            </p>
            {preview.conflictDates.map((date) => (
              <div key={date} className="flex items-center justify-between">
                <span>{date}</span>
                <div className="flex gap-2">
                  {(['skip', 'replace'] as ConflictResolution[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setResolutions((r) => ({ ...r, [date]: option }))}
                      className={`min-h-11 rounded-full border px-3 py-1 text-sm capitalize ${
                        resolutions[date] === option
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                          : 'border-[var(--color-line)] dark:border-[var(--color-line-dark)]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
            No conflicting dates.
          </p>
        )}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="min-h-11 flex-1 rounded-full border border-[var(--color-line)] px-4 py-2 dark:border-[var(--color-line-dark)]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleApplyImport}
            className="min-h-11 flex-1 rounded-full bg-[var(--color-accent)] px-4 py-2 text-white"
          >
            Import
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6" style={{ paddingTop: 'var(--safe-top)' }}>
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => navigate(-1)} className="min-h-11 min-w-11 text-[var(--color-muted)]">
          ← Back
        </button>
        <h1 className="font-serif text-xl">Settings</h1>
        <span className="w-11" />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
          Reminders
        </h2>
        {!notificationsSupported && (
          <p className="text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
            Native reminders require running the app on a device. They cannot be scheduled
            in this browser preview.
          </p>
        )}
        <label className="flex items-center justify-between">
          <span>Morning prompt reminder</span>
          <input
            type="checkbox"
            checked={settings.morningReminderEnabled}
            onChange={(e) => syncReminders({ morningReminderEnabled: e.target.checked })}
            className="h-6 w-6"
          />
        </label>
        <input
          type="time"
          value={settings.morningReminderTime}
          disabled={!settings.morningReminderEnabled}
          onChange={(e) => syncReminders({ morningReminderTime: e.target.value })}
          className="min-h-11 rounded-lg border border-[var(--color-line)] p-2 dark:border-[var(--color-line-dark)]"
        />
        <label className="flex items-center justify-between">
          <span>Evening reflection reminder</span>
          <input
            type="checkbox"
            checked={settings.eveningReminderEnabled}
            onChange={(e) => syncReminders({ eveningReminderEnabled: e.target.checked })}
            className="h-6 w-6"
          />
        </label>
        <input
          type="time"
          value={settings.eveningReminderTime}
          disabled={!settings.eveningReminderEnabled}
          onChange={(e) => syncReminders({ eveningReminderTime: e.target.value })}
          className="min-h-11 rounded-lg border border-[var(--color-line)] p-2 dark:border-[var(--color-line-dark)]"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
          Privacy and data
        </h2>
        <p className="text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
          Your memories are stored on this device. Deleting the app or losing this device
          may remove them. Cloud backup is not included in this version.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={handleExport}
          className="min-h-11 rounded-full border border-[var(--color-line)] px-4 py-2 dark:border-[var(--color-line-dark)]"
        >
          Export memories
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handlePickImport}
          className="min-h-11 rounded-full border border-[var(--color-line)] px-4 py-2 dark:border-[var(--color-line-dark)]"
        >
          Import memories
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setConfirmingDeleteAll(true)}
          className="min-h-11 rounded-full border border-red-300 px-4 py-2 text-red-600"
        >
          Delete all local data
        </button>
      </section>

      {message && <p role="status">{message}</p>}
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
          About
        </h2>
        <p className="text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
          Today&rsquo;s Memory helps you notice, capture, and remember the small moments
          that make your life meaningful.
        </p>
      </section>

      {import.meta.env.DEV && (
        <section className="flex flex-col gap-2 border-t border-dashed border-[var(--color-line)] pt-4 dark:border-[var(--color-line-dark)]">
          <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
            Developer (not shown in production builds)
          </h2>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              const count = await seedDemoData()
              setMessage(`Seeded ${count} demo memories.`)
              setBusy(false)
            }}
            className="min-h-11 rounded-full border border-dashed border-[var(--color-line)] px-4 py-2 text-sm dark:border-[var(--color-line-dark)]"
          >
            Seed demo data
          </button>
        </section>
      )}

      {confirmingDeleteAll && (
        <div role="alertdialog" aria-modal="true" className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--color-paper)] p-6 dark:bg-[var(--color-paper-dark)]">
            <h2 className="font-serif text-xl">Delete all local data?</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
              This permanently deletes every memory and photo on this device. This cannot be
              undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmingDeleteAll(false)}
                className="min-h-11 flex-1 rounded-full border border-[var(--color-line)] px-4 py-2 dark:border-[var(--color-line-dark)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                className="min-h-11 flex-1 rounded-full bg-red-600 px-4 py-2 text-white"
              >
                Delete everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
