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

## Backend

### Database

1. Copy `backend/.env.example` to `backend/.env` and adjust `DATABASE_URL` if needed.
2. Start PostgreSQL (for example `docker compose -f backend/docker-compose.yml up -d`).
3. Apply schema: `cd backend && npx prisma migrate deploy`
4. Seed routes (R001–R005) and sample ship compliance: `npm run prisma:seed`

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

```bash
npm run build
npm run lint
npm run format
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

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
