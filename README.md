# FuelEU Maritime Assignment

Monorepo for the FuelEU Maritime assignment: a **backend** API (Node.js, TypeScript) and a **web frontend** (React, TypeScript, Tailwind CSS). Both packages follow **hexagonal architecture** (ports and adapters).

## Repository

The intended public GitHub repository name is **`fueleu-maritime-assignment`**. Initialize the remote and push after cloning or scaffolding locally, for example:

```bash
git remote add origin https://github.com/<your-org>/fueleu-maritime-assignment.git
git push -u origin main
```

(Use `main` or `master` to match your default branch.)

## Requirements

- **Node.js** 20 or newer
- **npm** 10+ (or compatible package manager)

## Project layout

| Path | Description |
|------|-------------|
| `backend/` | HTTP API, PostgreSQL adapter (stub in Phase 1), composition in `src/infrastructure` |
| `frontend/` | React SPA with Vite; UI in `src/adapters/ui` |

Hexagonal folders (both apps):

- `src/core/domain` — domain model (entities, value objects)
- `src/core/application` — use cases / application services
- `src/core/ports` — inbound/outbound interfaces
- `src/adapters/` — inbound drivers (HTTP, UI) and outbound driven adapters (DB, APIs)
- `src/shared` — cross-cutting types/utilities

Backend additionally uses `src/infrastructure` for process-level wiring (server bootstrap, DB connection factory).

## Backend

```bash
cd backend
npm install
npm run dev
```

- Default HTTP port: **3000** (override with `PORT`).
- Health check: `GET /health`

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
