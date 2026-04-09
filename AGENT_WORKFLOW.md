# Agent workflow

This file records how AI agents were used during development and what was produced.

## Agents Used

- **Cursor agent (Composer)** — Phase 1: scaffolded `backend/` and `frontend/` (hexagonal layout, TypeScript strict, ESLint, Prettier, Tailwind on the frontend, minimal health API, CI). Commit: `Chore: Initialize hexagonal project structure and environment config`.
- **Cursor agent (Composer)** — Phase 2: Prisma + PostgreSQL schema and seed, FuelEU domain formulas, compliance/banking/pooling REST API, documentation updates. Commit: `Feat: Implement compliance domain logic and backend API endpoints`.

## Prompts & Outputs

### Phase 1 — Initialization (2026-04-09)

**Prompt (summary)**  
Implement Phase 1 only: create the GitHub repo name `fueleu-maritime-assignment`; add `frontend/` and `backend/` with TypeScript strict mode, ESLint, Prettier, strict hexagonal folder layout, backend Node + TS structure, frontend React + TS + Tailwind structure; add root `README.md`, `REFLECTION.md`, and `AGENT_WORKFLOW.md` (including this section); commit with the specified chore message.

**Output (summary)**  
- Backend: Node.js + TypeScript, Express `/health`, ports/use-case for health, outbound PostgreSQL adapter stub, infrastructure server entry and DB connection placeholder, ESLint (typescript-eslint strict) + Prettier.  
- Frontend: Vite + React + TypeScript + Tailwind CSS v4, sample use case and static config adapter, UI under `src/adapters/ui`, ESLint + Prettier.  
- Root: `.gitignore`, documentation files, GitHub Actions CI for lint/build.  
- Public repository **Rajneesh26D/fueleu-maritime-assignment** created with GitHub CLI; `origin` updated and initial commit pushed to `master`.

### Phase 2 — Backend core, schema, and API (2026-04-09)

**Prompt (summary)**  
Implement Phase 2 on `/backend`: PostgreSQL schema and seed (routes R001–R005, R001 baseline; tables `routes`, `ship_compliance`, `bank_entries`, `pools`, `pool_members`); core FuelEU formulas in `core/domain`; Express endpoints (`GET /routes`, `POST /routes/:id/baseline`, `GET /compliance/cb`, banking POSTs, `POST /pools` with greedy pooling and `Sum(CB) ≥ 0`); document pooling in this file; commit with `Feat: Implement compliance domain logic and backend API endpoints`.

**Output (summary)**  
- **Schema & data:** Prisma schema + migration + `prisma/seed.ts` for five routes and a sample ship compliance row (`SEED-SHIP-1` / 2025). `backend/docker-compose.yml` and `.env.example` for local Postgres.  
- **Domain:** `fuel-eu.constants.ts`, `compliance-balance.ts` (energy MJ and CB), `pool-allocation.ts` (greedy allocation).  
- **Application & adapters:** Use cases and Prisma repository implementations; Express wiring and error mapping in `http.server.ts`.  
- **Pooling algorithm (implemented):** After checking \(\sum_i CB_i \geq 0\), members with \(CB > 0\) are **donors** sorted by **descending** \(CB\) (largest surplus first). Members with \(CB < 0\) are **receivers** sorted by **ascending** \(CB\) (largest deficit first). Transfers are built by iterating receivers in order and drawing from donors in that order until each deficit is covered; remaining donor surplus is reported as `surplusRemainingGco2e`. This matches the requirement to prioritize surplus ships by descending CB and to move surplus onto deficits while keeping the pool feasible.  
- Commit: `Feat: Implement compliance domain logic and backend API endpoints`.
