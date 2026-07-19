import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Browser-preview PWA install support only. `@capacitor/core` sets up
// `window.Capacitor` in every environment (including plain browsers, as
// part of its own web-fallback routing) — presence alone doesn't mean
// native. `isNativePlatform()` is the actual signal: true only inside a
// real iOS/Android Capacitor WebView, which already has real offline
// storage via SQLite and Filesystem and must never pick up a service worker.
const capacitorGlobal = (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
const isNativeShell = capacitorGlobal?.isNativePlatform?.() ?? false

if (import.meta.env.PROD && 'serviceWorker' in navigator && !isNativeShell) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Installability/offline support is a nice-to-have for the browser
      // preview; a failed registration should never block the app itself.
    })
  })
}
