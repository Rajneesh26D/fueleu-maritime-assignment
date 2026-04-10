# AI Agent Workflow Log

This file records how AI agents were used during development and what was produced.

## Agents Used

- **Cursor agent (Composer)** — Phase 1: scaffolded `backend/` and `frontend/` (hexagonal layout, TypeScript strict, ESLint, Prettier, Tailwind on the frontend, minimal health API, CI). Commit: `Chore: Initialize hexagonal project structure and environment config`.
- **Cursor agent (Composer)** — Phase 2: Prisma + PostgreSQL schema and seed, FuelEU domain formulas, compliance/banking/pooling REST API, documentation updates. Commit: `Feat: Implement compliance domain logic and backend API endpoints`.
- **Cursor agent (Composer)** — Phase 3: React dashboard (four tabs), `FuelEuHttpAdapter`, Lucide + Recharts, Vite `/api` proxy; backend CORS, `GET /banking/balance`, per-route ship seed for Compare. Commit: `Feat: Complete React dashboard with Routes, Compare, Banking, and Pooling tabs`.
- **Cursor agent (Composer)** — Phase 4: Vitest unit tests for domain (`compliance-balance`, `route-comparison`, `pool-allocation`, `CreatePoolUseCase`), Supertest HTTP integration tests, frontend formula + `DashboardPage` smoke test; README architecture/setup/screenshots, `REFLECTION.md` essay, CI `npm test`. Commit: `Docs & Test: Finalize unit tests and mandatory documentation`.
- **Cursor agent (Composer)** — Spec alignment: assignment PDF endpoints (`GET /routes/comparison`, `GET /compliance/adjusted-cb`, `GET /banking/records`, `GET /routes?year=`), pool response `cb_before`/`cb_after`, KPI seed data, dashboard wiring, README/AGENT_WORKFLOW updates.

## Validation / Corrections

- After agent-generated edits, changes were checked with **`npm run lint`**, **`npm run test`**, and **`npm run build`** in `backend/` and `frontend/`.
- The official Fuel EU Maritime full-stack brief was compared to the codebase: missing REST surfaces were added and the UI was pointed at the new routes so behaviour matches the evaluation checklist (hex architecture, four tabs, formulas, tests).

## Best practices followed

- Domain rules live in **`src/core/domain`**; frameworks stay in adapters/infrastructure.
- Use cases depend on **ports**, not Prisma/Express directly (dependency inversion).
- **Supertest** integration tests mock `HttpAppDeps` so CI does not require PostgreSQL for route smoke tests.
- **Incremental commits** preserve a readable history (not a single monolithic dump).

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

### Phase 3 — Frontend dashboard (2026-04-09)

**Prompt (summary)**  
Build the Fuel EU Compliance Dashboard in `/frontend` with Tailwind: infrastructure API clients, four tabs (Routes with filters and Set Baseline; Compare with table and bar/line chart, percent diff vs baseline, compliance vs 89.3368; Banking with CB, Bank/Apply, disable when appropriate; Pooling with sum indicator and create when feasible). Lucide + Recharts, responsive UI. Commit message as specified.

**Output (summary)**  
- `FuelEuHttpAdapter` + `FuelEuApiPort`, React context provider and `useFuelEuApi`, tabbed dashboard under `src/adapters/ui/dashboard`.  
- Vite dev proxy `/api` → backend; optional `VITE_API_BASE_URL`.  
- Backend: `cors`, `GET /banking/balance`, seed rows for `SHIP-R001`–`SHIP-R005` linked to routes for Compare.  
- Commit: `Feat: Complete React dashboard with Routes, Compare, Banking, and Pooling tabs`.

### Phase 4 — Tests, documentation, polish (2026-04-09)

**Prompt (summary)**  
Phase 4: backend unit tests for ComputeComparison / ComputeCB / CreatePool (greedy), Supertest integration tests on API routes; frontend unit tests for comparison formula and component rendering; fill `AGENT_WORKFLOW.md` (prompts, corrections, Observations), expand `README.md` (architecture hexagonal, setup/run, UI screenshots), write `REFLECTION.md` (one page on AI-assisted work); verify `npm run test` and `npm run dev` in both packages, TypeScript strict + ESLint; final commit with message `Docs & Test: Finalize unit tests and mandatory documentation` and push to `origin main`.

**Output (summary)**  
- **Backend:** Vitest tests in `src/core/domain` and `create-pool.use-case.test.ts`; `route-comparison.ts` for shared % formula; `http.integration.test.ts` with mocked `HttpAppDeps` and Supertest; `tsconfig.build.json` excludes tests from `tsc` output; `npm run test`.  
- **Frontend:** `shared/comparison-formula.ts` + tests; `DashboardPage.test.tsx` with mocked `FuelEuApiPort`; Vitest + Testing Library + jsdom; `npm run test`.  
- **Docs:** README architecture diagram (Mermaid), setup/run, screenshot table pointing at `docs/screenshots/`; `REFLECTION.md` updated; this file updated including Observations below.  
- **CI:** workflow runs `npm run test` after lint in both packages.

**Corrections during Phase 4**  
- Aligned “Compute comparison” with an explicit domain helper (`percentDiffVsBaselineRoute`) in backend and a matching frontend `comparison-formula.ts` so tests and UI share one formula definition.  
- Split TypeScript emit for production (`tsconfig.build.json`) so test files under `src/` do not need to ship in `dist/`.

### Phase 5 — Assignment brief alignment (Fuel EU Maritime PDF)

**Prompt (summary)**  
Re-read the extractable assignment document; implement any missing API routes and UI wiring; keep documentation accurate; commit and push.

**Output (summary)**  
- **Backend:** `GET /routes/comparison?year=`, `GET /compliance/adjusted-cb?shipId&year=`, `GET /banking/records?shipId&year=`, `GET /routes?year=` (KPI merge); `POST /pools` response includes **`members`** with **`cbBefore`** / **`cbAfter`**; bank repository **`findEntries`**; seed uses KPI intensities where the brief defines them.  
- **Frontend:** Compare tab uses **`/routes/comparison`**; Routes tab uses **`/routes?year=`** for KPI columns; Banking shows adjusted CB + records table; Pooling shows member before/after from API.  
- **Docs:** README endpoint table + sample `curl` lines; this log updated.

## Observations (agent-assisted work)

**Where time was saved**  
- Boilerplate for Vitest, Supertest, and Testing Library followed standard patterns; mocking `HttpAppDeps` avoided spinning up PostgreSQL for route tests.  
- Reusing existing hexagonal boundaries made it obvious where to place tests (domain pure functions vs HTTP adapter).  
- CI copy-paste for `npm test` mirrored existing lint/build steps.

**Where mistakes or “hallucinations” were risky**  
- Early assumptions about file paths (e.g. confusing frontend/backend ports) are easy when skimming; verifying paths with the repo tree before editing avoids wrong imports.  
- README screenshot embeds require the PNGs to exist under `docs/screenshots/` in the committed tree.  
- Branch naming (`main` vs `master`): the remote may still use `master`; pushing requires matching the actual default branch or an explicit `main` branch creation — always confirm with `git branch -a` before pushing.
