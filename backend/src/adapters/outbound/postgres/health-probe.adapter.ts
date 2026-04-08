import type { PostgresConnection } from '../../../infrastructure/db/postgres.connection.js';
import type { HealthProbePort } from '../../../core/ports/health.port.js';

/** PostgreSQL-backed health probe; uses infrastructure connection wiring. */
export class PostgresHealthProbeAdapter implements HealthProbePort {
  constructor(private readonly connection: PostgresConnection) {}

  async checkDataStore(): Promise<boolean> {
    return this.connection.isReady();
  }
}
