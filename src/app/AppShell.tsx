import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { platformService } from '@/services'

const TABS = [
  { to: '/today', label: 'Today', icon: SunIcon },
  { to: '/memories', label: 'Memories', icon: BookIcon },
  { to: '/calendar', label: 'Calendar', icon: CalendarIcon },
]

export default function AppShell() {
  const navigate = useNavigate()
  const backHandlerRef = useRef<() => boolean>(() => true)

  useEffect(() => {
    const unsubscribe = platformService.addLifecycleListeners({
      onBackButton: () => backHandlerRef.current(),
    })
    return unsubscribe
  }, [])

  return (
    <div
      className="flex h-full flex-col bg-[var(--color-paper)] text-[var(--color-ink)] dark:bg-[var(--color-paper-dark)] dark:text-[var(--color-ink-dark)]"
      style={{ paddingTop: 'var(--safe-top)' }}
    >
      <header
        className="flex items-center justify-end px-4 py-2"
        style={{ paddingRight: 'calc(var(--safe-right) + 1rem)' }}
      >
        <button
          type="button"
          aria-label="Settings"
          onClick={() => navigate('/settings')}
          className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-muted)] hover:bg-black/5 dark:hover:bg-white/5"
        >
          <GearIcon />
        </button>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <Outlet context={{ setBackHandler: (fn: () => boolean) => (backHandlerRef.current = fn) }} />
      </main>

      <nav
        aria-label="Primary"
        className="flex justify-around border-t border-[var(--color-line)] bg-[var(--color-paper)]/95 py-1 backdrop-blur dark:border-[var(--color-line-dark)] dark:bg-[var(--color-paper-dark)]/95"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 0.25rem)' }}
      >
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-11 min-w-11 flex-col items-center gap-1 px-4 py-2 text-xs ${
                isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'
              }`
            }
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function SunIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
      />
    </svg>
  )
}
function BookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        d="M4 4.5A1.5 1.5 0 0 1 5.5 3H12v18H5.5A1.5 1.5 0 0 1 4 19.5v-15ZM20 4.5A1.5 1.5 0 0 0 18.5 3H12v18h6.5a1.5 1.5 0 0 0 1.5-1.5v-15Z"
      />
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M8 3v4M16 3v4M3.5 10h17" />
    </svg>
  )
}
function GearIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M17.6 6.4l-1.4 1.4M7.8 16.2l-1.4 1.4M17.6 17.6l-1.4-1.4M7.8 7.8 6.4 6.4"
      />
    </svg>
  )
}
