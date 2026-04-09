# FuelEU Maritime Assignment

Monorepo for the FuelEU Maritime assignment: a **backend** API (Node.js, TypeScript) and a **web frontend** (React, TypeScript, Tailwind CSS). Both packages follow **hexagonal architecture** (ports and adapters).

## Repository

Public GitHub repository: **[github.com/Rajneesh26D/fueleu-maritime-assignment](https://github.com/Rajneesh26D/fueleu-maritime-assignment)** (`master` branch).

## Requirements

- **Node.js** 20 or newer
- **npm** 10+ (or compatible package manager)

## Project layout

| Path | Description |
|------|-------------|
| `backend/` | HTTP API, Prisma + PostgreSQL, FuelEU compliance domain, composition in `src/infrastructure` |
| `frontend/` | React SPA with Vite; UI in `src/adapters/ui` |

Hexagonal folders (both apps):

- `src/core/domain` — domain model (entities, value objects)
- `src/core/application` — use cases / application services
- `src/core/ports` — inbound/outbound interfaces
- `src/adapters/` — inbound drivers (HTTP, UI) and outbound driven adapters (DB, APIs)
- `src/shared` — cross-cutting types/utilities

Backend additionally uses `src/infrastructure` for process-level wiring (server bootstrap, DB connection factory).

### Core formulas (project spec)

These drive the compliance API and dashboard (see `backend/src/core/domain`):

| Quantity | Formula |
|----------|---------|
| Target intensity (2025) | **89.3368** gCO2e/MJ (fixed in code for `year === 2025`) |
| Energy in scope (MJ) | **fuel consumption (t) × 41,000** MJ/t |
| Compliance balance (gCO2e) | **(Target − Actual) × Energy in scope** — positive ⇒ surplus, negative ⇒ deficit |
| Compare % vs baseline route | **((comparison / baseline) − 1) × 100** with GHG intensity actuals (gCO2e/MJ) |
| Pooling feasibility | **Sum(adjustedCB) ≥ 0** on member snapshots |

Full FuelEU regulatory equations (WtW, penalties, borrowing limits, etc.) are **out of scope** for this codebase; only the simplified project formulas above are implemented.

## Backend

### Database

1. Copy `backend/.env.example` to `backend/.env` and adjust `DATABASE_URL` if needed.
2. Start PostgreSQL (for example `docker compose -f backend/docker-compose.yml up -d`).
3. Apply schema: `cd backend && npx prisma migrate deploy`
4. Seed routes (R001–R005) and ship compliance for **2024–2026** (`SHIP-R001`…`SHIP-R005`, `SEED-SHIP-1`): `npm run prisma:seed`

### Run API

```bash
cd backend
npm install
npm run dev
```

- Default HTTP port: **3000** (override with `PORT`).
- **Health:** `GET /health`
- **Routes:** `GET /routes`, `POST /routes/:id/baseline` (`id` is route `id` or `code`, e.g. `R001`)
- **Compliance:** `GET /compliance/cb?shipId=&year=` — computes CB, persists snapshot on `ship_compliance`
- **Banking:** `POST /banking/bank`, `POST /banking/apply` — JSON `{ "shipId", "year", "amount" }`
- **Pooling:** `POST /pools` — JSON `{ "year", "name"?, "members": [{ "shipId", "complianceBalance" }] }`
- **Bank balance:** `GET /banking/balance?shipId=&year=` — JSON `{ "balance" }` (ledger: BANK minus APPLY)

```bash
npm run build
npm run lint
npm run format
```

## Frontend

The **Fuel EU Compliance** dashboard (Tailwind, Lucide, Recharts) calls the backend through `src/adapters/infrastructure/fuel-eu-http.adapter.ts`, which implements the `FuelEuApiPort` in `src/core/ports`. In development, Vite proxies **`/api/*`** to `http://localhost:3000` (see `frontend/vite.config.ts`), so the default client base URL is `/api`.

```bash
cd frontend
npm install
npm run dev
```

Optional: set `VITE_API_BASE_URL` in `frontend/.env` to point at a remote API (see `frontend/.env.example`).

**Tabs:** Routes (table, baseline, filters), Compare (GHG intensity table + chart vs target), Banking (CB + ledger via `GET /banking/balance`), Pooling (feasibility sum + create pool).

- **Compare year:** The chart loads compliance for `SHIP-{routeCode}` and the selected calendar year. The backend seed creates `ship_compliance` for **2024, 2025, and 2026** for those ships (re-run `npm run prisma:seed` after pulling updates if years are missing).
- **Pooling draft:** The Pooling form is persisted in **`sessionStorage`** (same browser tab) so edits survive page refresh and switching to other dashboard tabs; closing the tab clears it. This is UI-only (not stored on the server until you click **Create pool**).

```bash
npm run build
npm run lint
npm run format
```

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs lint and build for `backend` and `frontend` on push and pull requests.

## Documentation

- `REFLECTION.md` — design and process notes
- `AGENT_WORKFLOW.md` — agent-assisted workflow log (prompts and outputs)
