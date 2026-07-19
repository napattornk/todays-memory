import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Browser-preview PWA install support only. Native builds run inside a
// Capacitor WebView (which injects `window.Capacitor`) and must never pick
// up a service worker — they already have real offline storage via SQLite
// and Filesystem.
if (import.meta.env.PROD && 'serviceWorker' in navigator && !('Capacitor' in window)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Installability/offline support is a nice-to-have for the browser
      // preview; a failed registration should never block the app itself.
    })
  })
}
