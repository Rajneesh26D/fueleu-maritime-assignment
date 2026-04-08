import type { HealthProbePort, HealthStatus } from '../ports/health.port.js';

export class GetHealthUseCase {
  constructor(private readonly probe: HealthProbePort) {}

  async execute(): Promise<HealthStatus> {
    const dataStoreOk = await this.probe.checkDataStore();
    return { status: dataStoreOk ? 'ok' : 'degraded' };
  }
}
