# Agent workflow

This file records how AI agents were used during development and what was produced.

## Agents Used

- **Cursor agent (Composer)** — Phase 1 initialization: scaffolded `backend/` and `frontend/` with hexagonal directories, TypeScript strict configuration, ESLint, Prettier, Tailwind on the frontend, a minimal backend health API, root documentation, and a CI workflow. Commit prepared with message: `Chore: Initialize hexagonal project structure and environment config`.

## Prompts & Outputs

### Phase 1 — Initialization (2026-04-09)

**Prompt (summary)**  
Implement Phase 1 only: create the GitHub repo name `fueleu-maritime-assignment`; add `frontend/` and `backend/` with TypeScript strict mode, ESLint, Prettier, strict hexagonal folder layout, backend Node + TS structure, frontend React + TS + Tailwind structure; add root `README.md`, `REFLECTION.md`, and `AGENT_WORKFLOW.md` (including this section); commit with the specified chore message.

**Output (summary)**  
- Backend: Node.js + TypeScript, Express `/health`, ports/use-case for health, outbound PostgreSQL adapter stub, infrastructure server entry and DB connection placeholder, ESLint (typescript-eslint strict) + Prettier.  
- Frontend: Vite + React + TypeScript + Tailwind CSS v4, sample use case and static config adapter, UI under `src/adapters/ui`, ESLint + Prettier.  
- Root: `.gitignore`, documentation files, GitHub Actions CI for lint/build.  
- Public repository **Rajneesh26D/fueleu-maritime-assignment** created with GitHub CLI; `origin` updated and initial commit pushed to `master`.
