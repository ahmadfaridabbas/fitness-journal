# FitJournal

A personal fitness journal built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Recharts, and Radix UI. The existing Apple Health history and all page routes are preserved.

## Run locally

```sh
npm ci
npm run dev
```

Open http://localhost:3000/dashboard. For a production preview, run `npm run build` followed by `npm start`.

## Verify

```sh
npm test
npm run lint
npx tsc --noEmit
npm run build
```

The tests use Node's built-in test runner and the project's existing TypeScript compiler. No new runtime or test dependencies were added.

## Data and calculations

- `lib/data/imported-runs.json` is the original bundled Apple Health history. UI actions and import endpoints never overwrite it.
- `lib/data/real-runs.ts` normalizes this history. Existing run IDs remain compatible; short activities previously hidden by a distance filter are also included.
- `components/fitness/provider.tsx` combines bundled records with local changes. Browser storage uses the versioned `fitjournal-data-v1` key. Deleted workouts are retained and can be restored in Settings.
- `lib/fitness.ts` owns validation, date ranges, streaks, workout merging, goal progress, and chart aggregation. Distance and duration retain source precision. Running pace is total running minutes divided by running kilometres; walking is excluded from running metrics.
- Calendar dates are handled as local dates. Weeks start Monday. Ranges end today, rather than anchoring to the latest historical record. Current streak permits an activity yesterday and counts distinct active dates.
- Weight entries and goals start empty. Previous mock measurements, goals, scores, weather, and nutrition are retained in the legacy source file but are not represented as verified user data.
- Settings exports a JSON backup and restores validated version-1 backups after review. Restoration downloads the previous state first. Reports export activity CSVs.

## Import

The Import page accepts the extracted `apple_health_export` folder, automatically selecting `export.xml` and its GPX routes while ignoring `export_cda.xml` and unrelated files. Individual XML and GPX selection is also available. You can also select `export.zip` directly: the background worker reads GPS routes and streams the decompressed XML without holding the entire XML in memory. CDA documents and unrelated archive entries are ignored, and archives with missing or multiple workout exports are rejected. GPS routes retain their endpoints and are limited to 200 display points.

The Import page reads Apple Health `export.xml` and optional GPX files on the device using a background Web Worker. The XML is decoded incrementally, with progress and cancellation, then results are persisted in the browser. Files are not uploaded, so an empty server response or hosting upload/time limit cannot interrupt this import. Reimports skip duplicates, preserve edits, and can attach missing GPS routes. Parsing supports kilometre/metre/mile distance, minute/second/hour duration, signed time-zone offsets, and missing optional metrics. The calendar date at the workout source is preserved.

The compatibility `/api/import/apple-health` endpoint parses and returns records; it explicitly reports that they have not been persisted. The compatibility `/api/import/sync` endpoint uses the same parser as the browser worker. The active interface does not make an import network request.

## API and deployment boundaries

The Prisma/PostgreSQL schema remains in place but is not connected to an authenticated user backend. New data is device-local and does not sync across browsers. Server POST endpoints for records return 501 rather than falsely claiming to have saved data. Read endpoints describe their source or direct clients to browser-owned state.

The application remains a standard Next.js application suitable for the existing Netlify setup. Build with `npm run build`; keep the deployment's Next.js integration. The browser importer does not depend on server upload limits or a writable deployed filesystem. Device memory and browser storage capacity still apply; the compatibility server import endpoints remain subject to hosting limits. A deployed smoke test is required before treating a release as verified on Netlify.

No deployment was performed as part of this local upgrade.

## Interface

All existing routes are supported: dashboard, journal, analytics, goals, body, achievements, maps, shoes, weather, reports, ai-coach, settings, and import. The root redirects to the dashboard. The `/ai-coach` route presents calculated observations as “Training insights”; no AI service, recovery score, or medical inference is fabricated. Gear preserves the legacy shoe reference and labels its mileage unverified. GPS visuals show route shapes, not street-map tiles.

The shared interface includes light/dark themes, responsive navigation, keyboard-accessible dialogs, visible focus styles, reduced-motion support, accessible chart data tables, and clear empty states.
