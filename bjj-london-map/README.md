# BJJ London Map

Interactive map of Brazilian Jiu-Jitsu gyms across Greater London. Data is sourced from OpenStreetMap via the Overpass API and cached locally for faster reloads.

## Tech stack

- React 18 + Vite + TypeScript
- react-leaflet + Leaflet for mapping
- @turf/turf for geodesic ring polygons
- ky for HTTP requests
- zod for runtime validation
- Tailwind CSS for styling

## Getting started

```bash
pnpm install
pnpm dev
```

Then open http://localhost:5173/ (or the port printed in the terminal).

### Additional scripts

- `pnpm build` – type-check and produce a production build.
- `pnpm preview` – preview the production build locally.
- `pnpm typecheck` – run TypeScript in `--noEmit` mode.
- `pnpm lint` – run ESLint (errors only, no warnings allowed).
- `pnpm format` – check formatting with Prettier.
- `pnpm format:write` – apply Prettier formatting.

## Data flow & caching

1. On load, the app tries cached data in `localStorage` (key `bjj-gyms-v1`) with a 24 hour TTL.
2. If no valid cache is present, it attempts to read `public/gyms.json`. Seed this file manually if you want an offline sample (defaults to an empty array).
3. When required, the app queries the Overpass API with a single request scoped to Greater London, normalises & validates the response, displays the gyms immediately, and stores them in the cache.
4. Use the control panel to switch between “Cached” data and a fresh Overpass fetch, or to force a refresh.

> **Note:** Overpass is rate-limited. Avoid rapid refreshes; if you hit limits, either wait a few minutes or rely on the cached/seeded data.

## UI features

- Search gyms by name (debounced).
- Adjust ring radius (0.5–3 mi) and opacity (0.05–0.5).
- Toggle coverage rings on/off.
- Display of total vs filtered gym count.
- Legend explaining the 1 mile coverage rings.

## Project structure

```
bjj-london-map/
├─ public/gyms.json        # optional seeded data
├─ src/
│  ├─ components/          # MapView, Controls, Legend
│  ├─ lib/                 # Overpass fetching, storage TTL, turf helpers
│  ├─ state/useGyms.ts     # central hook for loading/filtering gyms
│  ├─ types/osm.ts         # OSM/Overpass typings
│  ├─ App.tsx, main.tsx    # app bootstrap
│  └─ styles.css           # Tailwind entry point
└─ ...
```

## Development tips

- If Overpass fails, the app keeps previously loaded data (if any) and shows an inline error. You can manually edit `public/gyms.json` to supply fallback gyms.
- Tailwind classes keep the control panel simple and lightweight; customise them in `src/styles.css` if desired.
- Coverage polygons are memoised per gym + radius to reduce repeated Turf computations.
