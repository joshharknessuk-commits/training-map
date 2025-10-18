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
# from the repository root
pnpm install
pnpm sync:gyms   # optional during local dev, required before deploying
pnpm dev
```

Then open http://localhost:3000/ (or the port printed in the terminal).

### Micro info card playground

Need a quick localhost link to preview the hover/click pop-up? Run:

```bash
pnpm playground:micro-card
```

This pins the dev server to `http://localhost:3100/`, so you can immediately visit
[`http://localhost:3100/playground/micro-card`](http://localhost:3100/playground/micro-card)
to inspect the micro info card without touching the main map UI.

### Additional scripts

- `pnpm build` – type-check and produce an optimized production build.
- `pnpm start` – run the production build locally.
- `pnpm sync:gyms` – load/refresh the database from `data/map-data.csv`.
- `pnpm export:gyms` – snapshot the current Postgres `gyms` table into `public/gyms.json` (used as a fallback dataset).
- `pnpm typecheck` – run TypeScript in `--noEmit` mode.
- `pnpm lint` – run ESLint (errors only, no warnings allowed).
- `pnpm format` – check formatting with Prettier.
- `pnpm format:write` – apply Prettier formatting.

### Database migrations & verification

The `gym_claims` table powers the “Claim this gym” submissions. Run the following once per environment (assumes the `pgcrypto` extension is available; Neon enables it by default):

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS gym_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id),
  claimant_name TEXT NOT NULL,
  claimant_email TEXT NOT NULL,
  proof_url TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

To apply locally:

```bash
# from the repository root
psql "$DATABASE_URL" <<'SQL'
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS gym_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id),
  claimant_name TEXT NOT NULL,
  claimant_email TEXT NOT NULL,
  proof_url TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);
SQL
```

### Local testing

Start the dev server (`pnpm dev`), then from another terminal run:

```bash
curl -X POST http://localhost:3000/api/claim \
  -H 'Content-Type: application/json' \
  -d '{
    "gymId": "00000000-0000-0000-0000-000000000000",
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "proof": "https://example.com/proof",
    "message": "We are the official team."
  }'
```

Expect a `{"success":true}` JSON response (422 on validation errors, 429 when rate limited). Claims appear in the `gym_claims` table.

## Data flow & caching

1. Run `pnpm sync:gyms` to load the curated CSV. The script pushes the raw rows into the `gyms_raw` staging table, geocodes each entry via Nominatim (using borough/nearest transport hints), inserts/updates the `gyms` table, and finally clears the staging table.
2. The Next.js API (`/api/gyms`) reads directly from the `gyms` table and returns JSON to the client. If the database is unreachable it falls back to the last exported `public/gyms.json`.
3. The client fetches once on load and renders the map from that response (automatically using the static snapshot if the API response is empty/unavailable). No Overpass calls or client-side caching are required.

> **Note:** Nominatim is also rate-limited. The sync script respects the service by spacing requests ~1.2s apart; avoid hammering it repeatedly.

### Deploying to Vercel

- Add the `DATABASE_URL` secret in the Vercel dashboard (Project → Settings → Environment Variables) **before** deploying. The backend only attempts to open the Postgres pool when the API runs, so builds succeed even if the variable is absent locally, but runtime requests will fail without it.
- Trigger a fresh deployment after the variable is in place. If you deploy without it, Vercel will serve a 404/500 because the server bundle cannot connect to the database.
- Run `pnpm sync:gyms` (or an equivalent automation) to populate the Neon database before or immediately after deploying to production.

## UI features

- Collapsible sidebar with search, borough filters, and coverage controls (radius, opacity, ring toggle).
- Brazilian flag-inspired theme (blue/green/yellow map accents) with glowing coverage rings and markers.
- Coverage rings toggle lives in the sidebar (off by default until enabled).
- Inline loading & error states to highlight the fetch status.
- “Claim this gym” flow: popup button launches a modal to submit owner verification, posting directly to Neon.
- “📍 Near me” flow that locates the user, sorts gyms by distance, highlights pins, and links straight to Google Maps directions.

### Near Me + Distance Sort

- `lib/distance.ts` exports `haversineKm(a, b)` (with `{ lat, lon|lng }`) for distance queries. It is pure client-side code and safe to use anywhere in the app.
- `components/NearMeButton.tsx` is a small Tailwind-styled client component that wraps `navigator.geolocation.getCurrentPosition`, showing a loading state and surfacing friendly permission errors.
- `components/GymList.tsx` accepts the gym array from `useGyms()`, stores the located coordinates with `useState`, and renders the top 2 gyms sorted by distance (1 decimal km + one-tap Directions links). When a location is available it emits the coordinates via `onUserLocation` so the map can fly and highlight the nearest markers.

Typical wiring inside `app/page.tsx`:

```tsx
const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

<MapView gyms={filteredGyms} userLocation={userLocation} highlightedGymIds={highlightedGymIds} />
<GymList gyms={filteredGyms} userLocation={userLocation} onUserLocation={setUserLocation} />
```

To add the button near an existing toolbar or header:

```tsx
import { NearMeButton } from '@/components/NearMeButton';

<NearMeButton onLocate={(coords) => setUserLocation(coords)} />
```

Local QA: run `pnpm dev`, load the map in Chrome/Edge/Safari (desktop or mobile), tap “📍 Near me”, grant permission, and verify that
1. the list switches to “Sorted by distance from you” with km distances,
2. the map flies to your blue location dot and highlights the two closest gyms, and
3. each Directions link opens Google Maps in a new tab. The flow falls back gracefully if permission is denied.

### Visualising the gym micro info card

Need to review the new hover/click pop-up in isolation? Start the dev server (`pnpm dev`) and open [`http://localhost:3000/playground/micro-card`](http://localhost:3000/playground/micro-card). The playground renders the same `GymMicroInfoCard` component with a handful of mock gyms so designers, PMs, and QA can quickly check styling across complete and partial datasets without navigating the full map.

## Project structure

```
bjj-london-map/
├─ app/                    # Next.js App Router entrypoints (layout, page, API)
├─ components/             # MapView, Controls, NearMeButton, etc. (client components)
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
