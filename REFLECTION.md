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

- Replace the DB stub with a real PostgreSQL pool and migrations.
- Centralize frontend dependency injection and add API client ports aligned with backend endpoints.
