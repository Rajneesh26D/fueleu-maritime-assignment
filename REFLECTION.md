# Reflection

## Phase 1 — Environment setup and hexagonal foundation

**Goals achieved**

- Split the codebase into `frontend/` and `backend/` with TypeScript **strict** settings (stricter checks enabled where appropriate for each toolchain).
- Applied **hexagonal architecture**: core (domain, application, ports) stays free of framework-specific code; adapters implement ports; infrastructure composes dependencies for the backend HTTP process.
- Standardized **ESLint** and **Prettier** in both packages for consistent formatting and lint rules.

**Trade-offs**

- The backend includes a minimal Express `/health` route and a **stub** PostgreSQL connection so the inbound HTTP and outbound DB adapter layers have a real shape before a database is introduced.
- The frontend wires a static config adapter inside the UI for Phase 1; a dedicated composition root (e.g. React context or DI container) can replace this when the app grows.

**Follow-ups for later phases**

- Centralize frontend dependency injection and add API client ports aligned with backend endpoints.

## Phase 2 — Backend core, schema, and domain logic

**Goals achieved**

- PostgreSQL schema via **Prisma** for `routes`, `ship_compliance`, `bank_entries`, `pools`, and `pool_members`, with an initial SQL migration and seed for routes **R001–R005** (R001 baseline) plus a sample `ship_compliance` row for local testing.
- **Core formulas** in `src/core/domain`: target intensity constant (2025), energy-in-scope from fuel mass, and compliance balance \(CB = (T - A) \times E\).
- **HTTP API**: routes listing and baseline selection, compliance CB snapshot, banking with balance checks, and pool creation with greedy surplus-to-deficit allocation (see `AGENT_WORKFLOW.md`).

**Notes**

- Route display names in the seed are placeholders where the assignment PDF was not available in the repository; codes **R001–R005** and baseline semantics match the task.

## Phase 3 — Frontend dashboard and UI adapters

**Goals achieved**

- **HTTP adapter** (`FuelEuHttpAdapter`) in `frontend/src/adapters/infrastructure` implements `FuelEuApiPort` and targets backend routes (default `/api` with Vite dev proxy).
- **Four tabs:** Routes (table, Set Baseline, vessel/fuel/year filters via UI metadata), Compare (intensity table, % vs baseline route, compliant vs target 89.3368, Recharts composed bar+line), Banking (CB + `GET /banking/balance`, Bank/Apply with disabled states), Pooling (member editor, sum indicator, create when feasible).
- **Backend additions** to support the UI: **CORS**, **`GET /banking/balance`**, and **seeded per-route ships** `SHIP-R001`…`SHIP-R005` so Compare can load real intensities.

**Notes**

- Vessel/fuel filters on Routes use static metadata (`route-filters.meta.ts`), not DB columns, to stay within the Phase 3 frontend scope while meeting the UX requirement.
