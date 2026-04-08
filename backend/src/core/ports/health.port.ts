/** Inbound application boundary: health status for the API surface. */
export interface HealthStatus {
  readonly status: 'ok' | 'degraded';
}

/** Outbound port: persistence / external system readiness (e.g. PostgreSQL). */
export interface HealthProbePort {
  checkDataStore(): Promise<boolean>;
}
