# Dead Code Sweep 06

## Checklist
- [x] Identify unreferenced UI components (Legend)
- [x] Remove redundant scripts (exportGyms.ts)
- [x] Update docs to reflect removals and ensure no lingering references
- [x] Run `pnpm lint`

## Findings & Removals
1. **components/Legend.tsx** was never imported anywhere in the repo (confirmed via `rg -n --glob '!.next/**' "Legend"`). Keeping it created a shallow module with zero consumers, so the component was deleted and README references were pruned to avoid future confusion.
2. **scripts/exportGyms.ts** duplicated the logic in the maintained `scripts/exportGyms.mjs`, but no npm script or import path referenced the TypeScript version (checked with `rg -n --glob '!.next/**' 'exportGyms.ts'`). Removing it prevents drift between two export implementations.

## Verification
- Commands run: `pnpm lint`
- Result: passes (Node 22 engine warning only)

## Follow-ups
- None required; `pnpm export:gyms` already uses the `.mjs` script and the live UI references only the remaining components.
