# Architecture Sweep — 2025-11-12

## Checklist
- [x] Consolidate shared navigation helpers into a deep module (`lib/directions.ts`) so UI code stays narrow.
- [x] Remove dead Leaflet helpers (`buildLink`, `clearCircles`) that violated the “delete unused code” rule.
- [x] Document the sweep scope and follow-ups under `docs/sweeping/`.
- [ ] Backfill behavior-level tests for `useGyms` filtering and data fallbacks.

## Findings & Actions
### Duplicate direction URL builders (MapView, GymList)
- **Misalignment:** Both components reimplemented the same Google Maps URL logic, which spread formatting knowledge into shallow modules.
- **Action:** Introduced `lib/directions.ts` with a single `buildDirectionsUrl` helper and updated the components to depend on it. This keeps UI components focused on rendering while the helper hides URL concerns.

### Dead helper exports (MapView `buildLink`, turf `clearCircles`)
- **Misalignment:** AGENTS.md directs us to delete unused code quickly. Both helpers were unused and increased cognitive load during map changes.
- **Action:** Removed the exports and their imports. The circle cache still works without an exposed clearing hook, and the unused HTML helper is gone.

### Remaining opportunities
- `useGyms` and `Controls` rely on shared behavior but have no colocated tests. Add focused tests (`useGyms.test.ts`) covering API fallback behavior and borough filtering before the next sweep.
- Monitor `NearMeButton` alerts/confirm prompts; extract them behind a notification helper if more consumers appear so we keep interfaces narrow.

> Any follow-up should continue to deepen modules instead of layering more props into already-large components.
