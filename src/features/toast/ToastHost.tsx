import { useToastMessage } from './toastStore'

export default function ToastHost() {
  const message = useToastMessage()
  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-4"
      style={{ top: 'calc(var(--safe-top) + 0.75rem)' }}
    >
      <div className="rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-sm font-medium text-[var(--color-paper)] shadow-lg">
        {message}
      </div>
    </div>
  )
}
