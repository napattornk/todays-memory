# Today's Memory

A private daily visual diary. Every morning, one thoughtful prompt to carry with you.
Later — usually in the evening — you reflect and choose one photo that best represents
what mattered that day.

**Live first. Reflect later.**

This is not a social network. There are no followers, likes, comments, public profiles,
feeds, streaks, or points — just your own memories, kept on your own device.

## Product overview

- One stable prompt per calendar day (deterministic — refreshing never changes it).
- Add today's memory: choose or take a photo, optional caption, save.
- **7-day grace period**: today and the previous 7 calendar days remain fully editable
  (photo + caption). Outside that window, a daily memory's photo locks — the caption
  stays editable and the memory stays shareable.
- **Retrospective memories**: add a memory to any older, empty date. These never lock,
  never show the original prompt, and are clearly (but subtly) badged "Added later."
- Timeline (month-grouped) and Calendar views of every memory.
- Turn any memory into a designed 1080×1920 Story image (3 templates, 4 backgrounds)
  and share it through the native share sheet.
- Full local backup/export and import (ZIP), with per-date conflict resolution.
- Morning/evening local reminders — real ones, only on a real device.

## Stack

- **React 19 + TypeScript + Vite** — app shell and build
- **Capacitor** (iOS + Android) — the primary runtime target; the browser build is a
  development/preview convenience, not a PWA-first product
- **Tailwind CSS v4** — styling
- **react-router-dom** (HashRouter) — routing, works identically inside a native WebView
- **@capacitor-community/sqlite** — structured memory metadata, prompts, settings (native)
- **Dexie/IndexedDB** — browser-only development fallback for the same storage interface
- **@capacitor/filesystem** — full photos, thumbnails, backups, generated Story images
- **@capacitor/camera**, **@capacitor/share**, **@capacitor/local-notifications**,
  **@capacitor/preferences**, **@capacitor/app**, **@capacitor/status-bar**,
  **@capacitor/keyboard**
- **Zod** — validation (persisted records, backup manifests)
- **JSZip** — backup archive format
- **html-to-image** — Story image rendering
- **Vitest + React Testing Library** — tests
- **ESLint + Prettier**

## Native-first architecture

All platform capability is behind service interfaces in `src/services/*`:

`PlatformService`, `PhotoService`, `MemoryStorageService`, `ShareService`,
`NotificationService`, `BackupService`.

Each has a `*.native.ts` implementation (real Capacitor plugins) and a `*.web.ts`
implementation (browser fallback: `<input type="file">`, Dexie, Web Share API, no-op
notifications). `src/services/index.ts` picks the right set at startup via
`Capacitor.isNativePlatform()`. UI components and business logic (`src/pages`,
`src/features`) only ever call the service interfaces — never `@capacitor/*` or raw
browser APIs directly. This is enforced by an ESLint `no-restricted-imports` rule
scoped to everything outside `src/services/**/*.native.ts` / `*.web.ts`.

## Local storage architecture

- **SQLite** (native) holds memory metadata: id, date, type, prompt id/snapshot,
  caption, file **paths**, timestamps. Migrations are versioned in `src/db/migrations.ts`
  — add new entries there (never edit past ones) when the schema changes.
- **Filesystem** (native) holds the actual image bytes: full diary photos, thumbnails,
  temporary generated Story images, and backup archives. SQLite never stores blobs.
- **IndexedDB/Dexie** is used **only** as the browser development fallback, mirroring
  the same shape, so the app is fully usable for local dev without a device.
- Photo saves are transactional at the feature level
  (`src/features/memories/saveMemory.ts`): the image pipeline runs, files are written,
  then the metadata row is inserted; if the metadata write fails, the just-written
  files are deleted so nothing is orphaned.

## Browser limitations (read before assuming something is "broken")

The browser preview build exists for fast iteration only. It intentionally cannot:

- Trigger the real native camera / photo-library picker UI (it falls back to
  `<input type="file">`, which still lets you pick or "take" a photo on most devices).
- Schedule real local notifications. Reminder scheduling is a documented no-op in the
  browser; Settings explains this rather than pretending it works.
- Guarantee a native share sheet (falls back to the Web Share API, or a plain download
  if that's unavailable too).
- Reliably save an image to a device photo library (falls back to a browser download).

None of this is simulated as if it were native behavior — the UI always tells you when
you're looking at a browser fallback.

## Instagram sharing limitation

"Share Story" opens the platform's native share sheet (or Web Share API in the
browser). Which apps appear there — Instagram, Messages, AirDrop, etc. — depends
entirely on what's installed and how the OS/apps register as share targets. This app
cannot guarantee Instagram will be offered, and does not claim to post directly into
Instagram Stories. Where native sharing isn't available, the UI says: *"Save image and
upload it to Instagram Stories manually."*

## Backup format

Export produces a `.zip` containing:

- `metadata.json` — a `BackupManifest` (Zod-validated): schema version, export
  timestamp, every memory (id, date, type, prompt id/snapshot, caption, timestamps,
  in-archive photo path), and settings.
- `photos/<memoryId>.jpg` — the full diary image for each memory. Thumbnails are
  regenerated on import rather than included, to keep the archive smaller.

Import: pick a `.zip` → validate with Zod → preview count + conflicting dates → choose
skip/replace per conflicting date → apply. The whole apply step is transactional
(`src/features/backup/importBackup.ts`): failures roll back any photo files already
written and leave existing data untouched.

## Development

```bash
npm install
npm run dev          # Vite dev server, browser-fallback services
npm run build         # tsc -b && vite build
npm run test           # vitest run
npm run lint            # eslint .
npm run typecheck        # tsc -b --noEmit
npm run format             # prettier --write .

npx cap sync            # copy the web build + sync native plugins
npx cap open ios         # opens Xcode — macOS + Xcode required
npx cap open android      # opens Android Studio — Android Studio + SDK required
```

### Platform prerequisites

- **iOS**: building and submitting requires **macOS and Xcode**. There is no way
  around this — Apple does not support building/signing iOS apps on Windows or Linux.
- **Android**: requires **Android Studio and the Android SDK** (a JDK is bundled with
  Android Studio).
- Native plugin behavior (camera, filesystem, share sheet, local notifications,
  SQLite) should be verified on a **physical device or platform-appropriate
  simulator/emulator** — the browser preview uses fallback implementations and is
  **not** the source of truth for native behavior.

### Dev-only demo data

Settings → "Developer" (only rendered when `import.meta.env.DEV` is true, i.e. never
in a production build) has a "Seed demo data" button that populates ~20 memories
across the last ~40 days, with gaps, retrospective entries, and varied caption
lengths/aspect ratios, for exercising Timeline/Calendar/Story flows without manual
data entry.

## Future cloud architecture (not implemented)

The service-interface boundary is deliberately set up so a future cloud-backed
implementation of `MemoryStorageService`/`BackupService` (e.g. Supabase, with
end-to-end-encrypted sync) can be dropped in without touching any page or component —
only a new `*.cloud.ts` implementation and a factory switch. Candidate future
extension points already anticipated by the architecture: accounts/auth, encrypted
cloud backup, cross-device sync, subscriptions, monthly/annual AI-assisted
reflections, "This Day" resurfacing, full-text search, and shared/family diaries. None
of this is implemented in the MVP.
