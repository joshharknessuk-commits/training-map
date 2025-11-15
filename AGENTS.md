# Repository Guidelines & Design Philosophy

> This file defines how AI agents and contributors should reason about and modify this codebase.  
> Before generating or refactoring code, read this document fully.  
> Your goal is to keep the system **simple, deep, and internally consistent**.

---

## Core Philosophy
- **Complexity is the root of evil** — fight it relentlessly.
- **Modules exist to hide complexity** — design interfaces, not implementations.
- **Deep modules, simple interfaces, and clarity over cleverness.**
- **Working code isn’t enough** — aim for code that stays simple as it grows.

---

## Design Decision Rules
- Prefer clarity over brevity; favor explicit names and visible contracts.
- Before adding code, look for an existing abstraction that serves the purpose.
- Refactor if a change increases duplication or coupling.
- Shallow modules are code smells; deepen boundaries by pushing complexity downward.
- If something feels clever, stop and simplify.
- When in doubt, make the code easier to read for a future maintainer.

---

## Project Structure & Roles
- Monorepo uses **pnpm**; primary workspace is `bjj-london-map/` (Next.js 14 + TypeScript).
- Inside:  
  - `app/` — App Router pages and `app/api/*` routes  
  - `components/` — UI widgets  
  - `lib/` — data/services  
  - `state/` — React hooks  
  - `types/` — shared TypeScript types  
  - `public/` — static assets  
  - `data/map-data.csv` — curated gym list  
  - `scripts/` — CSV → Postgres sync tools  
- Keep boundaries **deep** and interfaces **narrow**: UI talks to `lib/` helpers, not raw DB/HTTP; side effects are isolated and testable.

---

## Development Practices
- Common commands (run at repo root):  
  `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm start`,  
  `pnpm lint`, `pnpm typecheck`, `pnpm format:write`,  
  `pnpm sync:gyms`, `pnpm sync:geodata`.
- Set `DATABASE_URL` in `.env.local` before syncing or calling API routes.
- Prefer readable, self-documenting functions with short headers describing purpose and contracts.
- Delete dead code quickly. Remove commented-out or unused imports in the same PR.

---

## Code Style & Naming
- **Formatting:** Prettier (single quotes, trailing commas, Tailwind plugin) + ESLint (`next/core-web-vitals`, `prettier`).
- **Naming:**  
  - Components — PascalCase  
  - Functions/variables — camelCase  
  - Hooks — prefixed with `use`  
  - Files — kebab/camel case under `lib/` or `state/`
- Avoid speculative generality. Prefer small, composable utilities to sprawling “do-everything” modules.
- Write minimal, meaningful comments explaining “why,” not “what.”

---

## Agent Behavior
- Match existing structure, naming, and tone when creating new code.
- Keep functions short (<30 lines) unless hiding deep logic.
- Write concise JSDoc-style headers describing purpose and I/O.
- Do not invent abstractions or scaffolding that isn’t used.
- Prioritize **internal consistency** over novelty or performance tweaks.
- Always verify that new code reduces or contains complexity.

---

## Commits & Pull Requests
- Use Conventional Commits: `feat:`, `fix:`, `chore:` (scope optional).
- Each PR must **reduce or contain complexity** — simplify interfaces, remove duplication, clarify names.
- Include rationale in the PR description and screenshots for UI changes.
- Document any data sync or API updates (`pnpm sync:gyms`, etc.).

---

## Testing & Maintenance
- Keep tests simple and behavior-first.  
  Co-locate as `*.test.ts(x)` near features; test observable outcomes, not internals.
- If tests are hard to write, treat that as **design debt** — deepen modules, tighten contracts, clarify naming.
- After major data or API changes, rerun sync scripts locally to validate behavior.

---

> **Guiding Thoughts:**  
>"The goal of all theory is to make the basic elements as simple and as few as possible without having to surrender the adequate representation of experience." -*Albert Einstien* 
> “Good design is about managing complexity.” — *John Ousterhout*  
> Every contribution — human or AI — should leave the codebase simpler than before.
