import { TARGET_INTENSITY_2025_GCO2E_PER_MJ } from '../domain/fuel-eu.constants.js';
import { percentDiffVsBaselineRoute } from '../domain/route-comparison.js';
import type { ComplianceRepositoryPort } from '../ports/compliance.repository.port.js';
import type { RouteRepositoryPort } from '../ports/route.repository.port.js';
import { NotFoundError } from '../../shared/errors.js';
import { shipIdForRouteCode } from '../../shared/ship-from-route.js';

export interface RouteComparisonRow {
  readonly routeId: string;
  readonly routeCode: string;
  readonly shipId: string;
  readonly ghgIntensityGco2ePerMj: number;
  readonly targetIntensityGco2ePerMj: number;
  readonly percentDiff: number | null;
  readonly compliant: boolean;
  readonly isBaseline: boolean;
}

export class GetRoutesComparisonUseCase {
  constructor(
    private readonly routes: RouteRepositoryPort,
    private readonly compliance: ComplianceRepositoryPort,
  ) {}

  async execute(year: number): Promise<{ readonly year: number; readonly rows: readonly RouteComparisonRow[] }> {
    const all = await this.routes.findAll();
    const baseline = all.find((r) => r.isBaseline);
    if (!baseline) {
      throw new NotFoundError('No baseline route is configured');
    }
    const baselineShip = shipIdForRouteCode(baseline.code);
    const baselineRow = await this.compliance.findByShipYear(baselineShip, year);
    if (!baselineRow) {
      throw new NotFoundError(`No compliance data for baseline ship ${baselineShip} year ${String(year)}`);
    }
    const baselineGhg = baselineRow.actualIntensityGco2eMj;

    const rows: RouteComparisonRow[] = [];
    for (const route of all) {
      const shipId = shipIdForRouteCode(route.code);
      const row = await this.compliance.findByShipYear(shipId, year);
      if (!row) {
        continue;
      }
      const targetIntensityGco2ePerMj =
        row.year === 2025 ? TARGET_INTENSITY_2025_GCO2E_PER_MJ : row.targetIntensityGco2eMj;
      const compliant = row.actualIntensityGco2eMj <= targetIntensityGco2ePerMj;
      let percentDiff: number | null = null;
      if (route.isBaseline) {
        percentDiff = 0;
      } else if (baselineGhg > 0) {
        percentDiff = percentDiffVsBaselineRoute(row.actualIntensityGco2eMj, baselineGhg);
      }
      rows.push({
        routeId: route.id,
        routeCode: route.code,
        shipId,
        ghgIntensityGco2ePerMj: row.actualIntensityGco2eMj,
        targetIntensityGco2ePerMj,
        percentDiff,
        compliant,
        isBaseline: route.isBaseline,
      });
    }
    return { year, rows };
  }
}
