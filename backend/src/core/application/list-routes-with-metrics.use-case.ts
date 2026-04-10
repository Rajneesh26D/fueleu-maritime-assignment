import { getRouteKpi } from '../../shared/route-kpi.meta.js';
import { shipIdForRouteCode } from '../../shared/ship-from-route.js';
import type { ComplianceRepositoryPort } from '../ports/compliance.repository.port.js';
import type { RouteRepositoryPort } from '../ports/route.repository.port.js';

export interface RouteWithMetricsDto {
  readonly routeId: string;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly isBaseline: boolean;
  readonly createdAt: string;
  readonly year: number;
  readonly vesselType: string | null;
  readonly fuelType: string | null;
  readonly ghgIntensityGco2ePerMj: number | null;
  readonly fuelConsumptionTons: number | null;
  readonly distanceKm: number | null;
  readonly totalEmissionsTons: number | null;
}

export class ListRoutesWithMetricsUseCase {
  constructor(
    private readonly routes: RouteRepositoryPort,
    private readonly compliance: ComplianceRepositoryPort,
  ) {}

  async execute(year: number): Promise<readonly RouteWithMetricsDto[]> {
    const all = await this.routes.findAll();
    const out: RouteWithMetricsDto[] = [];
    for (const route of all) {
      const kpi = getRouteKpi(route.code, year);
      const shipId = shipIdForRouteCode(route.code);
      const row = await this.compliance.findByShipYear(shipId, year);
      out.push({
        routeId: route.id,
        code: route.code,
        name: route.name,
        description: route.description,
        isBaseline: route.isBaseline,
        createdAt: route.createdAt.toISOString(),
        year,
        vesselType: kpi?.vesselType ?? null,
        fuelType: kpi?.fuelType ?? null,
        ghgIntensityGco2ePerMj: row?.actualIntensityGco2eMj ?? kpi?.ghgIntensity ?? null,
        fuelConsumptionTons: row?.fuelConsumptionTons ?? kpi?.fuelConsumptionTons ?? null,
        distanceKm: kpi?.distanceKm ?? null,
        totalEmissionsTons: kpi?.totalEmissionsTons ?? null,
      });
    }
    return out;
  }
}
