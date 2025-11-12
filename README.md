# BJJ London Map

Interactive map of Brazilian Jiu-Jitsu gyms across Greater London. A curated dataset (see `data/map-data.csv`) drives the list of clubs, while coordinates come from OpenStreetMap’s Nominatim geocoding service. Results are persisted in a Postgres database for reuse.

## Tech stack

- Next.js 14 (App Router) + React 18 + TypeScript
- react-leaflet + Leaflet for mapping
- @turf/turf for geodesic ring polygons
- ky for HTTP requests
- zod for runtime validation
- Tailwind CSS for styling
- Postgres (Neon) backend + `pg` client

## Getting started

```bash
pnpm install
# Start the development server for the map workspace
pnpm --filter bjj-london-map dev
```

Once the server prints `ready` in the terminal, open http://localhost:3000/ in your browser (or whichever port the CLI reports).
The page will live-reload whenever you edit files under `bjj-london-map/`, so you can immediately test the updated location
behaviour.

### Additional scripts

- `pnpm build` – type-check and produce an optimized production build.
- `pnpm start` – run the production build locally.
- `pnpm sync:gyms` – load/refresh the database from `data/map-data.csv`.
- `pnpm typecheck` – run TypeScript in `--noEmit` mode.
- `pnpm lint` – run ESLint (errors only, no warnings allowed).
- `pnpm format` – check formatting with Prettier.
- `pnpm format:write` – apply Prettier formatting.

## Data flow & caching

1. Run `pnpm sync:gyms` to load the curated CSV. The script pushes the raw rows into the `gyms_raw` staging table, geocodes each entry via Nominatim (using borough/nearest transport hints), inserts/updates the `gyms` table, and finally clears the staging table.
2. The Next.js API (`/api/gyms`) reads directly from the `gyms` table and returns JSON to the client.
3. The client fetches once on load and renders the map from that response. No Overpass calls or client-side caching are required.

> **Note:** Nominatim is also rate-limited. The sync script respects the service by spacing requests ~1.2s apart; avoid hammering it repeatedly.

## UI features

- Collapsible control panel with quick access to ring radius (0.5–3 mi), opacity (0.05–0.5), and ring visibility.
- Brazilian flag-inspired theme (blue/green/yellow map accents) with glowing coverage rings and markers.
- Inline loading & error states to highlight the fetch status.

## Project structure

```
bjj-london-map/
├─ app/                    # Next.js App Router entrypoints (layout, page, API)
├─ components/             # MapView, Controls, NearMeButton (client components)
├─ data/map-data.csv       # curated master list of gyms
├─ lib/                    # Postgres pool, turf helpers, etc.
├─ public/                 # static assets
├─ scripts/syncGyms.ts     # CSV → staging → gyms sync + geocoding
├─ state/useGyms.ts        # central hook for loading/filtering gyms
└─ types/                  # shared TypeScript types & module declarations
```

## Development tips

- Set `DATABASE_URL` in `.env.local` (ignored by git). The `sync:gyms` script and API route rely on it.
- If the sync script reports a few gyms that could not be geocoded, inspect those rows manually—refining the `nearest transport` or borough fields usually helps.
- Tailwind classes keep the control panel simple and lightweight; customise them in `app/globals.css` or the respective component files if desired.
- Coverage polygons are memoised per gym + radius to reduce repeated Turf computations.
# training-map
