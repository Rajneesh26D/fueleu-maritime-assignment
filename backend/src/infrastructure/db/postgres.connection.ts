/** Placeholder for a future PostgreSQL pool / client; drives outbound adapter behavior. */
export interface PostgresConnection {
  isReady(): Promise<boolean>;
}

export function createPostgresConnection(): PostgresConnection {
  return {
    async isReady() {
      // Phase 1: no real DB; treat as healthy for scaffolding.
      return await Promise.resolve(true);
    },
  };
}
